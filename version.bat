@echo off
setlocal EnableDelayedExpansion

REM Load version from .env
set "version_file=.env"
for /f "tokens=2 delims==" %%i in (%version_file%) do set "version=%%i"

REM Split the version into components
for /f "tokens=1-3 delims=-" %%a in ("!version!") do (
    set "major=%%a"
    set "minor=%%b"
    set "patch=%%c"
)

REM Check the command-line argument
if "%~1" == "--major" (
    set /a major+=1
    set "minor=0"
    set "patch=0"
) else if "%~1" == "--minor" (
    set /a minor+=1
    set "patch=0"
) else if "%~1" == "--patch" (
    set /a patch+=1
) else (
    echo Invalid argument. Use --major, --minor, or --patch.
    exit /b 1
)

REM Update the version variable
set "new_version=!major!-!minor!-!patch!"

REM Call manifest.bat to update the manifest version
call manifest.bat !major! !minor! !patch!

REM Create the zip file
call zip.bat

REM Commit changes to Git
git add .
git commit -m "Bump version to !new_version!"

REM Create a temporary branch
set "temp_branch=zip-!new_version!"
git checkout -b !temp_branch!

REM Add the zip file to the temporary branch
git add "%cd%\PrimeEnhancer_v!new_version!.zip"
git commit -m "Add zip for version !new_version!"

REM Create a new Git tag
git tag "v!new_version!"

REM Uncomment the next line to push the changes
REM git push

REM Push the tag
git push origin "v!new_version!"

REM Checkout back to the main branch
git checkout main

REM Delete the temporary branch
git branch -D !temp_branch!

echo Version bumped to v!new_version! and changes committed.

endlocal
