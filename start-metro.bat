@echo off
REM Starts the Expo dev server (Metro) on port 8082 with TUNNEL mode,
REM so a phone with Expo Go can connect from any network.
REM Logs to metro.log. No CI var — watch mode + hot reload stay enabled.
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
call npx.cmd expo start --web --tunnel --port 8082 > metro.log 2>&1
