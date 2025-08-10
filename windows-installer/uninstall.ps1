# Air Lab Platform Uninstaller
# (c) 2025 Air Lab

param(
    [switch]$Silent = $false
)

$ErrorActionPreference = "Stop"

$AppName = "Air Lab AI Assistant Platform"
$InstallPath = "$env:ProgramFiles\AirLab"
$DataPath = "$env:APPDATA\AirLab"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Header {
    Clear-Host
    Write-ColorOutput "╔══════════════════════════════════════════════════════════════╗" "Red"
    Write-ColorOutput "║           Air Lab Platform Uninstaller                      ║" "Red"
    Write-ColorOutput "╚══════════════════════════════════════════════════════════════╝" "Red"
    Write-Host ""
}

function Remove-WindowsService {
    Write-ColorOutput "Removing Windows service..." "Yellow"
    
    try {
        Stop-Service "Air Lab Platform" -ErrorAction SilentlyContinue
        & sc.exe delete "Air Lab Platform" 2>&1 | Out-Null
        Write-ColorOutput "✓ Service removed" "Green"
    } catch {
        Write-ColorOutput "Service not found or already removed" "Gray"
    }
}

function Remove-ApplicationFiles {
    Write-ColorOutput "Removing application files..." "Yellow"
    
    if (Test-Path $InstallPath) {
        Remove-Item -Path $InstallPath -Recurse -Force
        Write-ColorOutput "✓ Application files removed" "Green"
    } else {
        Write-ColorOutput "Application files not found" "Gray"
    }
}

function Remove-UserData {
    $response = Read-Host "Do you want to remove user data and settings? (y/n)"
    
    if ($response -eq 'y') {
        if (Test-Path $DataPath) {
            Remove-Item -Path $DataPath -Recurse -Force
            Write-ColorOutput "✓ User data removed" "Green"
        }
    } else {
        Write-ColorOutput "User data preserved" "Yellow"
    }
}

function Remove-Shortcuts {
    Write-ColorOutput "Removing shortcuts..." "Yellow"
    
    # Desktop shortcut
    $DesktopShortcut = "$env:USERPROFILE\Desktop\Air Lab Platform.lnk"
    if (Test-Path $DesktopShortcut) {
        Remove-Item $DesktopShortcut -Force
    }
    
    # Start Menu folder
    $StartMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Air Lab"
    if (Test-Path $StartMenuPath) {
        Remove-Item $StartMenuPath -Recurse -Force
    }
    
    Write-ColorOutput "✓ Shortcuts removed" "Green"
}

# Main uninstall flow
Show-Header

if (!([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-ColorOutput "This uninstaller requires administrator privileges." "Red"
    Write-Host "Please run as Administrator."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "This will uninstall $AppName from your system."
Write-Host ""
$confirm = Read-Host "Are you sure you want to continue? (y/n)"

if ($confirm -eq 'y') {
    try {
        Remove-WindowsService
        Remove-ApplicationFiles
        Remove-UserData
        Remove-Shortcuts
        
        Write-Host ""
        Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
        Write-ColorOutput "     Uninstallation completed successfully!            " "Green"
        Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
    } catch {
        Write-ColorOutput "`nUninstallation failed: $_" "Red"
        exit 1
    }
} else {
    Write-Host "Uninstallation cancelled."
}

Read-Host "`nPress Enter to exit"