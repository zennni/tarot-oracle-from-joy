@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 18 or newer is required.
  pause
  exit /b 1
)
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)"
if errorlevel 1 (
  echo Node.js 18 or newer is required.
  pause
  exit /b 1
)
if not exist "node_modules\@openai\codex-sdk\package.json" (
  echo Installing pinned local dependencies...
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
call npm run local
if errorlevel 1 pause
