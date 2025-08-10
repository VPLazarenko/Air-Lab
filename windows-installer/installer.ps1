# Windows Air Lab Platform Installer
# (c) 2025 Air Lab - AI Assistant Platform
# Version: 1.0.0

param(
    [switch]$Silent = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

# Configuration
$AppName = "Air Lab AI Assistant Platform"
$AppVersion = "1.0.0"
$InstallPath = "$env:ProgramFiles\AirLab"
$DataPath = "$env:APPDATA\AirLab"
$NodeVersion = "20.19.3"
$PostgresVersion = "16"
$DefaultPort = 5000

# ASCII Art Logo
$Logo = @"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         █████╗ ██╗██████╗     ██╗      █████╗ ██████╗      ║
║        ██╔══██╗██║██╔══██╗    ██║     ██╔══██╗██╔══██╗     ║
║        ███████║██║██████╔╝    ██║     ███████║██████╔╝     ║
║        ██╔══██║██║██╔══██╗    ██║     ██╔══██║██╔══██╗     ║
║        ██║  ██║██║██║  ██║    ███████╗██║  ██║██████╔╝     ║
║        ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═╝╚═════╝      ║
║                                                              ║
║            AI Assistant Platform for Windows                 ║
║                   Professional Edition                       ║
╚══════════════════════════════════════════════════════════════╝
"@

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Welcome {
    Clear-Host
    Write-ColorOutput $Logo "Cyan"
    Write-Host ""
    Write-ColorOutput "Welcome to Air Lab AI Assistant Platform Installer" "Green"
    Write-ColorOutput "Version: $AppVersion" "Yellow"
    Write-Host ""
    Write-Host "This installer will:"
    Write-Host "  • Install Node.js runtime environment"
    Write-Host "  • Setup PostgreSQL database"
    Write-Host "  • Configure the application"
    Write-Host "  • Create desktop shortcuts"
    Write-Host "  • Register Windows service"
    Write-Host ""
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-NodeJS {
    Write-ColorOutput "`n[1/6] Installing Node.js..." "Yellow"
    
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    $nodeUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-x64.msi"
    
    if (!(Test-Path "$env:ProgramFiles\nodejs\node.exe")) {
        Write-Host "Downloading Node.js..."
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
        
        Write-Host "Installing Node.js..."
        Start-Process msiexec.exe -ArgumentList "/i", $nodeInstaller, "/quiet", "/norestart" -Wait
        
        # Add to PATH
        $env:Path = "$env:ProgramFiles\nodejs;$env:Path"
        [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)
        
        Remove-Item $nodeInstaller -Force
        Write-ColorOutput "✓ Node.js installed successfully" "Green"
    } else {
        Write-ColorOutput "✓ Node.js already installed" "Green"
    }
}

function Install-PostgreSQL {
    Write-ColorOutput "`n[2/6] Installing PostgreSQL..." "Yellow"
    
    $pgInstaller = "$env:TEMP\postgresql-installer.exe"
    $pgUrl = "https://get.enterprisedb.com/postgresql/postgresql-$PostgresVersion-1-windows-x64.exe"
    
    if (!(Test-Path "$env:ProgramFiles\PostgreSQL\$PostgresVersion\bin\psql.exe")) {
        Write-Host "Downloading PostgreSQL..."
        Invoke-WebRequest -Uri $pgUrl -OutFile $pgInstaller
        
        # Generate secure password
        $pgPassword = [System.Web.Security.Membership]::GeneratePassword(16, 4)
        
        Write-Host "Installing PostgreSQL..."
        Start-Process $pgInstaller -ArgumentList @(
            "--mode", "unattended",
            "--unattendedmodeui", "none",
            "--superpassword", $pgPassword,
            "--servicename", "postgresql-airlab",
            "--servicepassword", $pgPassword,
            "--serverport", "5432"
        ) -Wait
        
        # Save credentials
        $pgConfig = @{
            Host = "localhost"
            Port = 5432
            Database = "airlab"
            Username = "postgres"
            Password = $pgPassword
        }
        $pgConfig | ConvertTo-Json | Out-File "$DataPath\db-config.json" -Encoding UTF8
        
        Remove-Item $pgInstaller -Force
        Write-ColorOutput "✓ PostgreSQL installed successfully" "Green"
    } else {
        Write-ColorOutput "✓ PostgreSQL already installed" "Green"
    }
}

function Extract-Application {
    Write-ColorOutput "`n[3/6] Extracting application files..." "Yellow"
    
    # Create directories
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    New-Item -ItemType Directory -Path $DataPath -Force | Out-Null
    
    # Extract application from embedded resource
    $appArchive = "$PSScriptRoot\app.zip"
    if (Test-Path $appArchive) {
        Expand-Archive -Path $appArchive -DestinationPath $InstallPath -Force
        Write-ColorOutput "✓ Application files extracted" "Green"
    } else {
        Write-ColorOutput "✗ Application archive not found" "Red"
        exit 1
    }
}

function Configure-Application {
    Write-ColorOutput "`n[4/6] Configuring application..." "Yellow"
    
    # Load database config
    $dbConfig = Get-Content "$DataPath\db-config.json" | ConvertFrom-Json
    
    # Create .env file
    $envContent = @"
NODE_ENV=production
PORT=$DefaultPort
DATABASE_URL=postgresql://$($dbConfig.Username):$($dbConfig.Password)@$($dbConfig.Host):$($dbConfig.Port)/$($dbConfig.Database)
PGHOST=$($dbConfig.Host)
PGPORT=$($dbConfig.Port)
PGDATABASE=$($dbConfig.Database)
PGUSER=$($dbConfig.Username)
PGPASSWORD=$($dbConfig.Password)
SESSION_SECRET=$(New-Guid).ToString()
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin
LICENSE_KEY=0403198422061962
APP_NAME=Air Lab AI Assistant Platform
REPLIT_DOMAINS=localhost,$env:COMPUTERNAME
PUBLIC_OBJECT_SEARCH_PATHS=$DataPath\storage\public
PRIVATE_OBJECT_DIR=$DataPath\storage\private
"@
    
    $envContent | Out-File "$InstallPath\.env" -Encoding UTF8
    
    # Install dependencies
    Set-Location $InstallPath
    Write-Host "Installing dependencies..."
    & npm install --production 2>&1 | Out-Null
    
    # Initialize database
    Write-Host "Initializing database..."
    & npm run db:push 2>&1 | Out-Null
    
    Write-ColorOutput "✓ Application configured" "Green"
}

function Create-WindowsService {
    Write-ColorOutput "`n[5/6] Creating Windows service..." "Yellow"
    
    # Create service wrapper script
    $serviceScript = @"
const { Service } = require('node-windows');
const path = require('path');

const svc = new Service({
    name: 'Air Lab Platform',
    description: 'Air Lab AI Assistant Platform Service',
    script: path.join(__dirname, 'server', 'index.js'),
    nodeOptions: ['--harmony', '--max_old_space_size=4096'],
    env: [{
        name: 'NODE_ENV',
        value: 'production'
    }]
});

svc.on('install', () => {
    svc.start();
});

svc.install();
"@
    
    $serviceScript | Out-File "$InstallPath\service.js" -Encoding UTF8
    
    # Install node-windows
    & npm install node-windows --save 2>&1 | Out-Null
    
    # Install service
    & node service.js 2>&1 | Out-Null
    
    Write-ColorOutput "✓ Windows service created" "Green"
}

function Create-Shortcuts {
    Write-ColorOutput "`n[6/6] Creating shortcuts..." "Yellow"
    
    $WshShell = New-Object -ComObject WScript.Shell
    
    # Desktop shortcut
    $DesktopShortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Air Lab Platform.lnk")
    $DesktopShortcut.TargetPath = "http://localhost:$DefaultPort"
    $DesktopShortcut.IconLocation = "$InstallPath\assets\icon.ico"
    $DesktopShortcut.Description = "Air Lab AI Assistant Platform"
    $DesktopShortcut.Save()
    
    # Start Menu shortcut
    $StartMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Air Lab"
    New-Item -ItemType Directory -Path $StartMenuPath -Force | Out-Null
    
    $StartMenuShortcut = $WshShell.CreateShortcut("$StartMenuPath\Air Lab Platform.lnk")
    $StartMenuShortcut.TargetPath = "http://localhost:$DefaultPort"
    $StartMenuShortcut.IconLocation = "$InstallPath\assets\icon.ico"
    $StartMenuShortcut.Description = "Air Lab AI Assistant Platform"
    $StartMenuShortcut.Save()
    
    # Uninstaller shortcut
    $UninstallerShortcut = $WshShell.CreateShortcut("$StartMenuPath\Uninstall Air Lab.lnk")
    $UninstallerShortcut.TargetPath = "powershell.exe"
    $UninstallerShortcut.Arguments = "-ExecutionPolicy Bypass -File `"$InstallPath\uninstall.ps1`""
    $UninstallerShortcut.IconLocation = "%SystemRoot%\System32\shell32.dll,31"
    $UninstallerShortcut.Description = "Uninstall Air Lab Platform"
    $UninstallerShortcut.Save()
    
    Write-ColorOutput "✓ Shortcuts created" "Green"
}

function Request-LicenseKey {
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════" "Cyan"
    Write-ColorOutput "                LICENSE ACTIVATION                      " "Yellow"
    Write-ColorOutput "═══════════════════════════════════════════════════════" "Cyan"
    Write-Host ""
    
    $validKey = "0403198422061962"
    $attempts = 3
    
    while ($attempts -gt 0) {
        $inputKey = Read-Host "Please enter your license key"
        
        if ($inputKey -eq $validKey) {
            Write-ColorOutput "`n✓ License activated successfully!" "Green"
            return $true
        } else {
            $attempts--
            if ($attempts -gt 0) {
                Write-ColorOutput "Invalid license key. $attempts attempts remaining." "Red"
            } else {
                Write-ColorOutput "License activation failed. Please contact support." "Red"
                return $false
            }
        }
    }
}

# Main installation flow
function Start-Installation {
    Show-Welcome
    
    if (!(Test-Administrator)) {
        Write-ColorOutput "This installer requires administrator privileges." "Red"
        Write-Host "Please run as Administrator."
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "Press any key to begin installation..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    try {
        Install-NodeJS
        Install-PostgreSQL
        Extract-Application
        Configure-Application
        Create-WindowsService
        Create-Shortcuts
        
        Write-Host ""
        Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
        Write-ColorOutput "     Installation completed successfully!               " "Green"
        Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
        
        if (Request-LicenseKey) {
            Write-Host ""
            Write-Host "Air Lab Platform is now installed and running."
            Write-Host "Access the platform at: http://localhost:$DefaultPort"
            Write-Host ""
            Write-Host "Default admin credentials:"
            Write-Host "  Username: Admin"
            Write-Host "  Password: admin"
            Write-Host ""
            
            # Open browser
            Start-Process "http://localhost:$DefaultPort"
        }
        
    } catch {
        Write-ColorOutput "`nInstallation failed: $_" "Red"
        exit 1
    }
    
    Read-Host "Press Enter to exit"
}

# Run installation
Start-Installation