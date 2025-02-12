@echo off

call "start_mongo.cmd"
TIMEOUT /T 7 /NOBREAK>nul
call npm run dev %*