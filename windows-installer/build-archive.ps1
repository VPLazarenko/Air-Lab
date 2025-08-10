# Air Lab Platform - Windows Archive Builder
# Creates a complete installation archive with all application files

$ErrorActionPreference = "Stop"

Write-Host "=== Air Lab Platform Archive Builder ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$projectRoot = Split-Path -Parent $PSScriptRoot
$archiveName = "AirLab-Platform-Windows-Installer"
$outputDir = "$projectRoot\client\public\downloads"
$tempDir = "$env:TEMP\AirLab-Build-$(Get-Random)"

# Create directories
Write-Host "Creating build directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path "$tempDir\$archiveName" | Out-Null

# Copy application files
Write-Host "Copying application files..." -ForegroundColor Yellow

# Create folder structure
$folders = @(
    "client",
    "server", 
    "shared",
    "windows-installer",
    "attached_assets"
)

foreach ($folder in $folders) {
    $source = "$projectRoot\$folder"
    $dest = "$tempDir\$archiveName\$folder"
    
    if (Test-Path $source) {
        Write-Host "  - Copying $folder..." -ForegroundColor Gray
        Copy-Item -Path $source -Destination $dest -Recurse -Force -Exclude @(
            "node_modules",
            "dist",
            ".vite",
            "*.log",
            "*.tmp"
        )
    }
}

# Copy root files
Write-Host "Copying configuration files..." -ForegroundColor Yellow
$rootFiles = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "postcss.config.js",
    "tailwind.config.ts",
    "drizzle.config.ts",
    "components.json",
    ".gitignore"
)

foreach ($file in $rootFiles) {
    $source = "$projectRoot\$file"
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination "$tempDir\$archiveName\" -Force
    }
}

# Create environment template
Write-Host "Creating environment template..." -ForegroundColor Yellow
@"
# Air Lab Platform Environment Configuration
# This file will be automatically configured during installation

# Database Configuration
DATABASE_URL=postgresql://airlab:airlab123@localhost:5432/airlab_platform
PGHOST=localhost
PGPORT=5432
PGUSER=airlab
PGPASSWORD=airlab123
PGDATABASE=airlab_platform

# OpenAI Configuration
OPENAI_API_KEY=

# Application Settings
NODE_ENV=production
PORT=5000

# Session Secret (will be generated during installation)
SESSION_SECRET=

# Google Cloud Storage (optional)
GCS_BUCKET_NAME=
GCS_PROJECT_ID=

# License Key
LICENSE_KEY=0403198422061962

# Admin Credentials
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin
"@ | Out-File -FilePath "$tempDir\$archiveName\.env.template" -Encoding UTF8

# Create installation batch file
Write-Host "Creating installation script..." -ForegroundColor Yellow
@"
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
"@ | Out-File -FilePath "$tempDir\$archiveName\install.bat" -Encoding ASCII

# Create uninstaller
Write-Host "Creating uninstaller..." -ForegroundColor Yellow
@"
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
"@ | Out-File -FilePath "$tempDir\$archiveName\uninstall.bat" -Encoding ASCII

# Create README
Write-Host "Creating README..." -ForegroundColor Yellow
Copy-Item -Path "$projectRoot\windows-installer\README.md" -Destination "$tempDir\$archiveName\README.md" -Force

# Create the archive
Write-Host "Creating ZIP archive..." -ForegroundColor Yellow
$archivePath = "$outputDir\$archiveName.zip"

# Remove old archive if exists
if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
}

# Create new archive
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $archivePath)

# Cleanup temp directory
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

# Calculate archive size
$archiveSize = (Get-Item $archivePath).Length / 1MB
$formattedSize = "{0:N2}" -f $archiveSize

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Archive created successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archive location: $archivePath" -ForegroundColor Cyan
Write-Host "Archive size: $formattedSize MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "The archive contains:" -ForegroundColor Yellow
Write-Host "  - Complete application source code"
Write-Host "  - Windows installer scripts"
Write-Host "  - Database setup scripts"
Write-Host "  - Environment configuration templates"
Write-Host "  - Installation and uninstallation utilities"
Write-Host ""
Write-Host "To install, extract the archive and run 'install.bat' as Administrator" -ForegroundColor Green