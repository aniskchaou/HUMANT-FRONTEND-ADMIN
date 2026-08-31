@echo off
setlocal

echo ========================================================
echo  Starting Humant HRMS Launcher
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js was not detected on this machine.
  echo.
  echo Attempting to install Node.js LTS with Winget...
  winget install OpenJS.NodeJS.LTS -h --accept-source-agreements --accept-package-agreements
  if %errorlevel% neq 0 (
    echo.
    echo Automated installation failed. Opening the Node.js download page.
    start https://nodejs.org
    exit /b 1
  )
)

node "%~dp0launcher.js"
pause