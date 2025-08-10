@echo off
:: Air Lab Platform Installer Launcher
:: (c) 2025 Air Lab

title Air Lab Platform Installer

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo =====================================
    echo  Air Lab Platform Installer
    echo =====================================
    echo.
    echo This installer requires administrator privileges.
    echo.
    echo Right-click on this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

:: Run PowerShell installer
powershell.exe -ExecutionPolicy Bypass -File "%~dp0installer.ps1"

exit /b %errorlevel%