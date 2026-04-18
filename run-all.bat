@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Book & Vibe - Full Stack Development Server
echo ===============================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: ngrok not found. Install from: https://ngrok.com/download
    echo.
)

REM Create separate PowerShell windows for each service
echo Starting services...
echo.

REM Start Backend
echo [1/3] Starting Backend on port 5000...
start "Backend" powershell -NoExit -Command "cd 'c:\Users\harih\Downloads\book and vibe\backend' && npm install && npm run dev"
timeout /t 3

REM Start Web App
echo [2/3] Starting Web App on port 3000...
start "Web App" powershell -NoExit -Command "cd 'c:\Users\harih\Downloads\book and vibe\web-app' && npm install && npm run dev"
timeout /t 3

REM Start Admin Dashboard
echo [3/3] Starting Admin Dashboard on port 3001...
start "Admin Dashboard" powershell -NoExit -Command "cd 'c:\Users\harih\Downloads\book and vibe\admin-dashboard' && npm install && npm run dev"
timeout /t 3

REM Start ngrok tunnels
echo.
echo ===============================================
echo Starting ngrok tunnels (optional)...
echo ===============================================
echo.
echo [1] Backend tunnel (port 5000)...
start "ngrok Backend" powershell -NoExit -Command "ngrok http 5000"
timeout /t 2

echo [2] Web App tunnel (port 3000)...
start "ngrok Web App" powershell -NoExit -Command "ngrok http 3000"
timeout /t 2

echo [3] Admin Dashboard tunnel (port 3001)...
start "ngrok Admin" powershell -NoExit -Command "ngrok http 3001"

echo.
echo ===============================================
echo All services started!
echo ===============================================
echo.
echo LOCAL ACCESS:
echo - Backend:          http://localhost:5000
echo - Web App:          http://localhost:3000
echo - Admin Dashboard:  http://localhost:3001
echo.
echo Check the ngrok windows for public URLs to share with friends!
echo.
pause
