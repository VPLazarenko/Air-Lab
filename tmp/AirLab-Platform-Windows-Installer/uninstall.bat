@echo off
cls
echo ============================================
echo   Air Lab Platform - Uninstaller
echo ============================================
echo.

set /p confirm="Are you sure you want to uninstall Air Lab Platform? (y/n): "
if /i not "%confirm%"=="y" exit /b 0

echo Stopping services...
sc stop "AirLabPlatform" >nul 2>&1
sc delete "AirLabPlatform" >nul 2>&1

echo Removing installation files...
rmdir /s /q "C:\Program Files\AirLab" >nul 2>&1
rmdir /s /q "%APPDATA%\AirLab" >nul 2>&1

echo Removing desktop shortcuts...
del "%USERPROFILE%\Desktop\Air Lab Platform.lnk" >nul 2>&1
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Air Lab Platform.lnk" >nul 2>&1

echo.
echo Uninstallation completed.
echo.
pause