@echo off
title StoreRate Portal Launcher
echo ========================================================
echo   Starting StoreRate Full-Stack Application
echo ========================================================

echo Starting Backend API on http://localhost:5000 ...
start "StoreRate Backend" cmd /k "cd /d %~dp0backend && npm start"

echo Starting Frontend on http://127.0.0.1:3000 ...
start "StoreRate Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers started!
echo Frontend: http://127.0.0.1:3000
echo Backend:  http://localhost:5000
echo.
pause
