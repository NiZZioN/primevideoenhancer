@echo off
setlocal

REM Set the output zip filename with version
set "version_file=.env"
for /f "tokens=2 delims==" %%i in (%version_file%) do set "version=%%i"

REM Format the zip name
set "zip_name=PrimeEnhancer_v%version%.zip"

REM Create the zip file and include directories
powershell -Command "Compress-Archive -Path 'css', 'icons', 'background.js', 'content.js', 'LICENSE', 'manifest.json', 'popup.html', 'popup.js' -DestinationPath '%cd%\%zip_name%'"

echo Created zip file: %zip_name%

endlocal
