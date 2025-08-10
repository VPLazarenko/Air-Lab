@echo off
cls
echo ============================================
echo   Air Lab Platform - Windows Installer
echo   (c) 2025 Initiology AI Systems Lazarenko
echo ============================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This installer requires Administrator privileges.
    echo Please right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Starting installation...
echo.

:: Run PowerShell installer
powershell.exe -ExecutionPolicy Bypass -File "%~dp0windows-installer\installer.ps1"

if %errorLevel% equ 0 (
    echo.
    echo ============================================
    echo   Installation completed successfully!
    echo ============================================
    echo.
    echo The application is now available at:
    echo http://localhost:5000
    echo.
    echo Admin credentials:
    echo Username: Admin
    echo Password: admin
    echo.
    echo License key: 0403198422061962
    echo.
    pause
) else (
    echo.
    echo Installation failed. Please check the error messages above.
    echo.
    pause
)