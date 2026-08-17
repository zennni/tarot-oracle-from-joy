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
where npm >nul 2>nul
if errorlevel 1 (
  echo npm is required.
  pause
  exit /b 1
)
call :validate_dependencies
if errorlevel 1 (
  echo Installing pinned local dependencies...
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
  call :validate_dependencies
  if errorlevel 1 (
    echo Dependency validation failed.
    pause
    exit /b 1
  )
)
call npm run local
set "local_exit=%errorlevel%"
if not "%local_exit%"=="0" pause
exit /b %local_exit%

:validate_dependencies
if not exist "node_modules\.bin\tsx.cmd" exit /b 1
if not exist "node_modules\@openai\codex-sdk\dist\index.js" exit /b 1
node -e "import('@openai/codex-sdk').then(m => process.exit(typeof m.Codex === 'function' ? 0 : 1)).catch(() => process.exit(1))"
if errorlevel 1 exit /b 1
if not exist "node_modules\@openai\codex\bin\codex.js" exit /b 1
node -e "const fs=require('node:fs'),path=require('node:path');const arch=process.arch==='x64'?'x64':process.arch==='arm64'?'arm64':'';const target=arch==='x64'?'x86_64-pc-windows-msvc':arch==='arm64'?'aarch64-pc-windows-msvc':'';const file=path.join('node_modules','@openai','codex-win32-'+arch,'vendor',target,'bin','codex.exe');process.exit(arch&&fs.existsSync(file)?0:1)"
if errorlevel 1 exit /b 1
node "node_modules\@openai\codex\bin\codex.js" --version >nul 2>nul
if errorlevel 1 exit /b 1
exit /b 0
