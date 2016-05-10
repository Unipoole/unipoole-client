cd %cd%/unipoole/server
@echo off

REM Check if port 80 is available and set the port number to the address and also pass it as an argument to the node server
netstat /a /n | findstr /rc:":80 .*LISTENING" >nul || set tmp_freeport=80&& goto found

REM Search for open port in the specified range and set the port number to the address and also pass it as an argument to the node server
for /L %%a in (8000,1,8100) do netstat /a /n | findstr /rc:":%%a .*LISTENING" >nul || set tmp_freeport=%%a&& goto found

:found
  echo Port found: %tmp_freeport%
  start node nodeServer.js -port %tmp_freeport%
  REM wait 0.5 sec before opening the start.html page
  timeout /T 0.5 /NOBREAK>nul
  start http://localhost:%tmp_freeport%/start.html
  echo Address: http://localhost:%tmp_freeport%/start.html  