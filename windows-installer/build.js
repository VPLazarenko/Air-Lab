// Build script for Air Lab Platform Windows installer
// Creates a standalone package with all dependencies

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const BUILD_DIR = path.join(__dirname, 'build');
const DIST_DIR = path.join(__dirname, 'dist');
const ROOT_DIR = path.join(__dirname, '..');

// Files and directories to include
const INCLUDE_PATTERNS = [
  'client/**/*',
  'server/**/*',
  'shared/**/*',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'components.json',
  '.replit'
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.env',
  '*.log',
  'dist',
  'build',
  '.vscode',
  '.idea'
];

async function clean() {
  console.log('Cleaning build directories...');
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true });
  }
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

async function copyFiles() {
  console.log('Copying application files...');
  
  // Copy main application files
  INCLUDE_PATTERNS.forEach(pattern => {
    const sourcePath = path.join(ROOT_DIR, pattern.split('/')[0]);
    const targetPath = path.join(BUILD_DIR, pattern.split('/')[0]);
    
    if (fs.existsSync(sourcePath)) {
      copyRecursive(sourcePath, targetPath);
    }
  });
  
  // Copy package files
  const packageFiles = ['package.json', 'package-lock.json', 'tsconfig.json', 
                       'vite.config.ts', 'tailwind.config.ts', 'postcss.config.js',
                       'drizzle.config.ts', 'components.json'];
  
  packageFiles.forEach(file => {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(BUILD_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  if (fs.lstatSync(src).isDirectory()) {
    const files = fs.readdirSync(src);
    files.forEach(file => {
      if (!EXCLUDE_PATTERNS.some(pattern => file.includes(pattern))) {
        copyRecursive(path.join(src, file), path.join(dest, file));
      }
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function createProductionConfig() {
  console.log('Creating production configuration...');
  
  // Create production .env.example
  const envExample = `# Air Lab Platform Configuration
NODE_ENV=production
PORT=5000

# Database (will be configured during installation)
DATABASE_URL=postgresql://postgres:password@localhost:5432/airlab
PGHOST=localhost
PGPORT=5432
PGDATABASE=airlab
PGUSER=postgres
PGPASSWORD=password

# Session
SESSION_SECRET=will-be-generated-during-installation

# Admin credentials
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin

# License
LICENSE_KEY=0403198422061962

# Application
APP_NAME=Air Lab AI Assistant Platform
REPLIT_DOMAINS=localhost

# Storage paths (will be configured during installation)
PUBLIC_OBJECT_SEARCH_PATHS=
PRIVATE_OBJECT_DIR=
`;
  
  fs.writeFileSync(path.join(BUILD_DIR, '.env.example'), envExample);
  
  // Create startup script
  const startupScript = `#!/usr/bin/env node
// Air Lab Platform Startup Script

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check license
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  if (!env.includes('LICENSE_KEY=0403198422061962')) {
    console.error('Invalid or missing license key');
    process.exit(1);
  }
}

// Start the application
const server = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});
`;
  
  fs.writeFileSync(path.join(BUILD_DIR, 'start.js'), startupScript);
}

async function createAssets() {
  console.log('Creating assets...');
  
  const assetsDir = path.join(BUILD_DIR, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  
  // Create icon (simple SVG converted to ICO placeholder)
  const iconContent = `[Desktop Entry]
Name=Air Lab Platform
Exec=node start.js
Icon=airlab
Type=Application
Categories=Development;`;
  
  fs.writeFileSync(path.join(assetsDir, 'airlab.desktop'), iconContent);
}

async function buildClient() {
  console.log('Building client application...');
  
  // Build Vite application
  process.chdir(ROOT_DIR);
  execSync('npm run build', { stdio: 'inherit' });
  
  // Copy built files
  const distPath = path.join(ROOT_DIR, 'dist');
  if (fs.existsSync(distPath)) {
    copyRecursive(distPath, path.join(BUILD_DIR, 'dist'));
  }
}

async function createArchive() {
  console.log('Creating application archive...');
  
  const output = fs.createWriteStream(path.join(DIST_DIR, 'app.zip'));
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`Archive created: ${archive.pointer()} bytes`);
      resolve();
    });
    
    archive.on('error', reject);
    
    archive.pipe(output);
    archive.directory(BUILD_DIR, false);
    archive.finalize();
  });
}

async function createInstaller() {
  console.log('Creating Windows installer package...');
  
  // Copy installer scripts
  const installerFiles = ['installer.ps1', 'uninstall.ps1', 'install.bat'];
  installerFiles.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  });
  
  // Create final installer package
  const finalOutput = fs.createWriteStream(path.join(DIST_DIR, 'AirLab-Platform-Windows-Installer.zip'));
  const finalArchive = archiver('zip', { zlib: { level: 9 } });
  
  return new Promise((resolve, reject) => {
    finalOutput.on('close', () => {
      console.log(`Installer package created: ${finalArchive.pointer()} bytes`);
      resolve();
    });
    
    finalArchive.on('error', reject);
    
    finalArchive.pipe(finalOutput);
    finalArchive.directory(DIST_DIR, false);
    finalArchive.finalize();
  });
}

async function build() {
  try {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║        Air Lab Platform - Windows Installer Builder         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    
    await clean();
    await copyFiles();
    await createProductionConfig();
    await createAssets();
    await buildClient();
    await createArchive();
    await createInstaller();
    
    console.log('');
    console.log('✅ Build completed successfully!');
    console.log(`📦 Installer package: ${path.join(DIST_DIR, 'AirLab-Platform-Windows-Installer.zip')}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
build();