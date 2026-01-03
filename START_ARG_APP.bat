@echo off
REM ARG Finance App - Startup Script
REM Place shortcut to this file in Windows Startup folder

echo Starting ARG Finance Services...

REM Start Apache (XAMPP)
echo Starting Apache...
start "" "D:\xampp\apache\bin\httpd.exe"

REM Wait 3 seconds for Apache to start
timeout /t 3 /nobreak > nul

REM Start Backend Server (hidden)
echo Starting Backend Server...
start "" wscript.exe "D:\xampp\htdocs\finance-arg\server\start-hidden.vbs"

echo.
echo ARG Finance Services Started!
echo.
echo Access the app at: http://192.168.1.31 or http://localhost
echo.
pause
