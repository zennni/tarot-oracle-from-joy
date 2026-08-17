(function (root) {
  'use strict';
  const TEXT = {
    local_page_required: { zh: '请运行本地启动器，并在它打开的页面中使用本地 Codex。', en: 'Run the local launcher and use Local Codex in the page it opens.' },
    busy: { zh: '本地 Codex 正在处理上一条请求，请稍后再试。', en: 'Local Codex is processing the previous request.' },
    upstream_timeout: { zh: '本地 Codex 响应超时，本次请求不会自动重试。', en: 'Local Codex timed out. This request will not be retried.' },
    upstream_failed: { zh: '本地 Codex 调用失败，请确认 ChatGPT 登录状态。', en: 'Local Codex failed. Check the ChatGPT login state.' },
    chatgpt_login_required: { zh: 'Codex 当前未使用 ChatGPT 登录，请先完成登录。', en: 'Codex is not signed in with ChatGPT.' },
    response_too_large: { zh: '本地 Codex 返回内容过长。', en: 'Local Codex returned too much text.' },
    unavailable: { zh: '本地 Codex 未启动或无法连接。', en: 'Local Codex is not running or cannot be reached.' },
  };
  function isLocalPage(location) {
    return location.protocol === 'http:' && location.hostname === '127.0.0.1' && location.port === '43127';
  }
  function chatUrl(location) { return isLocalPage(location) ? '/v1/chat/completions' : ''; }
  function healthUrl(location) { return isLocalPage(location) ? '/health' : ''; }
  function errorText(code, language) {
    const entry = TEXT[code] || TEXT.unavailable;
    return entry[language === 'zh' ? 'zh' : 'en'];
  }
  root.LocalCodexUI = Object.freeze({ isLocalPage, chatUrl, healthUrl, errorText });
})(globalThis);
