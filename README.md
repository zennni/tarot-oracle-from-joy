# Tarot Oracle

## 本地 Codex 使用

前提：Windows 已安装 Node.js 18+，Codex 已执行 ChatGPT 登录。

最简单的启动方式是双击 `start-local-codex.cmd`。首次启动会按锁文件安装依赖；随后服务只监听 `http://127.0.0.1:43127` 并自动打开本地网页。

也可以运行：

```powershell
npm ci
npm run local
```

在设置中选择“本地 Codex（ChatGPT 登录）”，点击“检测本地 Codex”。检测只访问 `/health`，不会调用模型。生成解读或追问才会各自发起一次 Codex 请求，失败不会自动重试。

## 离线验证

```powershell
npm run verify
```

测试使用假 runner，不调用模型。

## 边界

本地 Codex 服务不是公网或局域网中转站，不导出 ChatGPT Pro 余额，不提供通用 OpenAI API 权益，也不能显示一次请求具体扣减了多少额度。线上 GitHub Pages 继续支持原有 provider；本地 Codex 只能在启动器打开的回环页面中使用。
