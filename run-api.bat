@echo off
title Forge Control API
cd /d "%~dp0api"
if not exist "node_modules" npm install --no-bin-links
node migrate.js
node server.js
pause
