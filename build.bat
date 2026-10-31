@echo off
echo =========================================
echo   CodEPharm - Build Installer (Windows)
echo =========================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Please install from https://nodejs.org/ first.
  pause
  exit /b 1
)
echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)
echo Building renderer and Electron...
call npm run build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)
echo Building NSIS installer...
call npx electron-builder --win nsis
if errorlevel 1 (
  echo electron-builder failed.
  pause
  exit /b 1
)
echo.
echo Done! Installer is in the "release" folder.
pause
