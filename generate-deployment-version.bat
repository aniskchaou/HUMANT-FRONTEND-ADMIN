@echo off
setlocal

echo ========================================================
echo  Humant Deployment Version Generator
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js was not detected. Please install Node.js LTS first.
  start https://nodejs.org
  exit /b 1
)

node "%~dp0generate-deployment-version.js"
pause