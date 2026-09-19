@echo off
title Forge Control App
cd /d "%~dp0"
if not exist "node_modules" npm install --no-bin-links
npx electron .
pause
