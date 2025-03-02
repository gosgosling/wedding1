@echo off
echo Stopping Nginx...
taskkill /F /IM nginx.exe
timeout /t 2
echo Starting Nginx...
cd D:\Nginx\nginx-1.27.4
start nginx
echo Done!
pause 