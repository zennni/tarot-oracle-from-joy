import { Buffer } from "node:buffer";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { adaptChatCompletionRequest, RequestValidationError } from "./request-adapter.js";
import { FIXED_MODEL, formatChatCompletionSse, ResponseValidationError } from "./sse-adapter.js";

export const LOCAL_HOST = "127.0.0.1" as const;
export const LOCAL_PORT = 43127;
export const DEFAULT_BODY_LIMIT_BYTES = 128 * 1024;
export const DEFAULT_TIMEOUT_MS = 120_000;

export type PromptRunner = (prompt: string, signal: AbortSignal) => Promise<string>;
export type StartLocalServerOptions = {
  rootDirectory: string;
  runner: PromptRunner;
  authCheck?: () => Promise<boolean>;
  port?: number;
  bodyLimitBytes?: number;
  timeoutMs?: number;
};
export type LocalServer = {
  host: typeof LOCAL_HOST;
  port: number;
  origin: string;
  closed: Promise<void>;
  close: () => Promise<void>;
};

class PublicHttpError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code);
    this.name = "PublicHttpError";
  }
}

const ROOT_FILE_MIME = new Map([
  ["index.html", "text/html; charset=utf-8"],
  ["app.js", "text/javascript; charset=utf-8"],
  ["local-codex-ui.js", "text/javascript; charset=utf-8"],
  ["cards.js", "text/javascript; charset=utf-8"],
  ["waite.js", "text/javascript; charset=utf-8"],
  ["waite_cn.js", "text/javascript; charset=utf-8"],
  ["xyj_lore.js", "text/javascript; charset=utf-8"],
  ["html2canvas.min.js", "text/javascript; charset=utf-8"],
  ["manifest.json", "application/manifest+json; charset=utf-8"],
  ["icon-192.png", "image/png"],
  ["icon-512.png", "image/png"],
  ["og-cover.jpg", "image/jpeg"],
]);
const allowedAssetRoot = (segment: string) => segment.startsWith("牌面-") || segment === "打赏码";

const ASSET_MIME = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function writeJsonBody(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    connection: "close",
  });
  response.end(JSON.stringify(body));
}

function writeJson(response: ServerResponse, status: number, code: string): void {
  writeJsonBody(response, status, { error: { code } });
}

function classifyError(error: unknown): { status: number; code: string } {
  if (error instanceof PublicHttpError) return { status: error.status, code: error.code };
  if (error instanceof RequestValidationError) return { status: 400, code: error.code };
  if (error instanceof ResponseValidationError) return { status: 502, code: error.code };
  return { status: 500, code: "internal_error" };
}

function requestPath(rawUrl: string | undefined): string {
  try {
    const encoded = new URL(rawUrl ?? "/", "http://local.invalid").pathname;
    const decoded = decodeURIComponent(encoded);
    if (decoded.includes("\0") || decoded.includes("\\")) throw new Error("invalid_path");
    return decoded;
  } catch {
    throw new PublicHttpError(404, "not_found");
  }
}

function staysInside(root: string, candidate: string): boolean {
  const value = relative(root, candidate);
  return value !== "" && !value.startsWith(`..${sep}`) && value !== ".." && !isAbsolute(value);
}

async function staticCandidate(realRoot: string, pathname: string): Promise<{ path: string; mime: string }> {
  const relativeName = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const segments = relativeName.split("/");
  if (segments.some((segment) => !segment || segment === ".." || segment.startsWith("."))) {
    throw new PublicHttpError(404, "not_found");
  }
  const rootMime = segments.length === 1 ? ROOT_FILE_MIME.get(segments[0]) : undefined;
  const assetAllowed = segments.length > 1 && allowedAssetRoot(segments[0]);
  const mime = rootMime ?? (assetAllowed ? ASSET_MIME.get(extname(segments.at(-1) ?? "").toLowerCase()) : undefined);
  if (!mime) throw new PublicHttpError(404, "not_found");
  const candidate = resolve(realRoot, ...segments);
  if (!staysInside(realRoot, candidate)) throw new PublicHttpError(404, "not_found");
  let resolvedCandidate: string;
  try {
    resolvedCandidate = await realpath(candidate);
  } catch {
    throw new PublicHttpError(404, "not_found");
  }
  if (!staysInside(realRoot, resolvedCandidate) || !(await stat(resolvedCandidate)).isFile()) {
    throw new PublicHttpError(404, "not_found");
  }
  return { path: resolvedCandidate, mime };
}

async function readBoundedBody(request: IncomingMessage, limitBytes: number): Promise<string> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > limitBytes) {
      request.resume();
      throw new PublicHttpError(413, "body_too_large");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function closeServer(server: Server): Promise<void> {
  if (!server.listening) return Promise.resolve();
  return new Promise((resolvePromise, rejectPromise) => {
    server.close((error) => error ? rejectPromise(error) : resolvePromise());
  });
}

export async function startLocalServer(options: StartLocalServerOptions): Promise<LocalServer> {
  const realRoot = await realpath(options.rootDirectory);
  const bodyLimitBytes = options.bodyLimitBytes ?? DEFAULT_BODY_LIMIT_BYTES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const authCheck = options.authCheck ?? (async () => true);
  const controllers = new Set<AbortController>();
  let busy = false;
  let actualPort = options.port ?? LOCAL_PORT;
  let origin = "";

  const handleCompletion = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    busy = true;
    let runnerStarted = false;
    let timer: NodeJS.Timeout | undefined;
    let disconnected = false;
    let timedOut = false;
    try {
      const contentType = request.headers["content-type"] ?? "";
      if (!contentType.toLowerCase().startsWith("application/json")) {
        throw new PublicHttpError(415, "unsupported_media_type");
      }
      const rawBody = await readBoundedBody(request, bodyLimitBytes);
      let decoded: unknown;
      try { decoded = JSON.parse(rawBody); } catch { throw new PublicHttpError(400, "invalid_json"); }
      const { prompt } = adaptChatCompletionRequest(decoded);
      const controller = new AbortController();
      controllers.add(controller);
      const onDisconnect = (): void => {
        if (!response.writableEnded) {
          disconnected = true;
          controller.abort();
        }
      };
      request.once("aborted", onDisconnect);
      response.once("close", onDisconnect);
      const runnerPromise = Promise.resolve().then(() => options.runner(prompt, controller.signal));
      runnerStarted = true;
      void runnerPromise.then(
        () => { busy = false; controllers.delete(controller); },
        () => { busy = false; controllers.delete(controller); },
      );
      const timeout = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          timedOut = true;
          controller.abort();
          reject(new PublicHttpError(504, "upstream_timeout"));
        }, timeoutMs);
      });
      let content: string;
      try {
        content = await Promise.race([runnerPromise, timeout]);
      } catch (error) {
        if (timedOut) throw new PublicHttpError(504, "upstream_timeout");
        if (disconnected || response.destroyed) return;
        if (error instanceof PublicHttpError) throw error;
        throw new PublicHttpError(502, "upstream_failed");
      } finally {
        if (timer) clearTimeout(timer);
        request.off("aborted", onDisconnect);
        response.off("close", onDisconnect);
      }
      const sse = formatChatCompletionSse(content);
      response.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store",
        connection: "close",
      });
      response.end(sse);
    } finally {
      if (!runnerStarted) busy = false;
    }
  };

  const dispatch = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    try {
      if (request.headers.host !== `${LOCAL_HOST}:${actualPort}`) {
        throw new PublicHttpError(403, "invalid_host");
      }
      const pathname = requestPath(request.url);
      if (request.method === "GET" && pathname === "/health") {
        const authenticated = await authCheck();
        writeJsonBody(response, 200, {
          status: authenticated ? "ok" : "not_ready",
          auth: authenticated ? "chatgpt" : "required",
          model: FIXED_MODEL,
        });
        return;
      }
      if (request.method === "POST" && pathname === "/v1/chat/completions") {
        if (request.headers.origin !== origin) throw new PublicHttpError(403, "invalid_origin");
        if (busy) throw new PublicHttpError(429, "busy");
        if (!(await authCheck())) throw new PublicHttpError(503, "chatgpt_login_required");
        if (busy) throw new PublicHttpError(429, "busy");
        await handleCompletion(request, response);
        return;
      }
      if (request.method === "GET") {
        const file = await staticCandidate(realRoot, pathname);
        const content = await readFile(file.path);
        response.writeHead(200, {
          "content-type": file.mime,
          "content-length": content.length,
          "cache-control": "no-cache",
          connection: "close",
        });
        response.end(content);
        return;
      }
      throw new PublicHttpError(404, "not_found");
    } catch (error) {
      if (!response.headersSent && !response.destroyed) {
        const publicError = classifyError(error);
        writeJson(response, publicError.status, publicError.code);
      } else if (!response.destroyed) {
        response.end();
      }
    }
  };

  const server = createServer((request, response) => { void dispatch(request, response); });
  let markClosed!: () => void;
  const closed = new Promise<void>((resolvePromise) => { markClosed = resolvePromise; });
  server.once("close", markClosed);
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const onError = (error: NodeJS.ErrnoException): void => {
      server.off("listening", onListening);
      rejectPromise(new Error(error.code === "EADDRINUSE" ? "port_in_use" : "listen_failed"));
    };
    const onListening = (): void => {
      server.off("error", onError);
      resolvePromise();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(actualPort, LOCAL_HOST);
  });
  const address = server.address();
  if (!address || typeof address === "string" || (address as AddressInfo).address !== LOCAL_HOST) {
    await closeServer(server);
    throw new Error("loopback_bind_failed");
  }
  actualPort = (address as AddressInfo).port;
  origin = `http://${LOCAL_HOST}:${actualPort}`;
  const close = async (): Promise<void> => {
    for (const controller of controllers) controller.abort();
    await closeServer(server);
  };
  return { host: LOCAL_HOST, port: actualPort, origin, closed, close };
}
