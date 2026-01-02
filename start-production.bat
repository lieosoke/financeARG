@echo off
setlocal

echo ===================================================
echo   Starting ARG App (Production)
echo ===================================================

echo.
echo [1/2] Starting Backend Server...
start "ARG App Backend" /D "server" cmd /c "npm start"

echo.
echo Waiting for Backend to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo [2/2] Starting Frontend Server...
echo Application will be available at: http://localhost:5173
echo.
echo You can minimize these windows, but DO NOT CLOSE them.
echo To stop the application, close the opened windows.
echo.

:: Using npx serve to host the static files
:: -s: Single page application mode
:: -l: Listen on port 5173 (binds to 0.0.0.0 by default, allowing external access)
cmd /c "npx serve -s dist -l 5173"

endlocal
