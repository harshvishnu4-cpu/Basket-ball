@echo off
REM RimCheck launcher. Works fully offline.
REM If Node.js is installed it serves the game on localhost (most robust for audio);
REM otherwise it opens index.html directly, which also works in Chrome/Edge.
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8080/
  node serve.js 8080
) else (
  start "" "%~dp0index.html"
)
