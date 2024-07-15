@echo off
setlocal enabledelayedexpansion

REM Load the current version from .env
for /f "tokens=2 delims==" %%i in ('findstr VERSION .env') do (
    set "version=%%i"
)

REM Split the version into major, minor, and patch
for /f "tokens=1,2,3 delims=-" %%a in ("!version!") do (
    set "major=%%a"
    set "minor=%%b"
    set "patch=%%c"
)

REM Check command line argument for version bump
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

REM Construct the new version string
set "new_version=!major!-!minor!-!patch!"

REM Update the .env file
(
    for /f "delims=" %%i in (.env) do (
        if "%%i"=="VERSION=!version!" (
            echo VERSION=!new_version!
        ) else (
            echo %%i
        )
    )
) > .env.tmp && move /Y .env.tmp .env

REM Call the zip script
call zip_project.bat

REM Call the manifest update script
call update_manifest.bat !new_version!

REM Commit changes to Git
git add .
git commit -m "Bump version to !new_version!"
REM Uncomment the next line to push the changes
git push

REM Create a new Git tag
git tag "!new_version!"
REM Uncomment the next line to push the tag
git push origin "!new_version!"

echo Updated version to !new_version!

endlocal
