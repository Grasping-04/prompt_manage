@echo off
cd /d "%~dp0"
echo Starting development server...
echo.
echo Browser will open at http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
start http://localhost:5173
npm run dev
