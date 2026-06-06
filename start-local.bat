@echo off
setlocal
cd /d "%~dp0"
echo Starting local presentation server...
echo Open http://127.0.0.1:8765/
python -m http.server 8765 --bind 127.0.0.1
