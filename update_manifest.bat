@echo off
setlocal enabledelayedexpansion

REM Get the new version from the argument
set "new_version=%~1"

REM Replace '-' with '.' for the manifest version
set "formatted_version=!new_version:-=.!"

REM Update manifest.json with the new version
powershell -Command "(Get-Content manifest.json) -replace '\"version\": \".*?\"', '\"version\": \"!formatted_version!\"' | Set-Content manifest.json"

echo Updated manifest.json to version !formatted_version!

endlocal
