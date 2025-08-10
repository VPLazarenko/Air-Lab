#!/bin/bash

# Air Lab Assistant Builder - Mac OS Installer
# Copyright (c) 2025 Initiology AI Systems

set -e

echo "==============================================="
echo "    Air Lab Assistant Builder Installer"
echo "    AI Platform by Initiology AI Systems"
echo "==============================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Ошибка: Данный установщик предназначен только для Mac OS"
    exit 1
fi

# Create application directory
APP_DIR="/Applications/AirLab-Assistant-Builder"
echo "📁 Создание директории приложения..."
sudo mkdir -p "$APP_DIR"

# Copy application files
echo "📋 Копирование файлов приложения..."
sudo cp -R ./app/* "$APP_DIR/"

# Make scripts executable
sudo chmod +x "$APP_DIR/start.sh"
sudo chmod +x "$APP_DIR/stop.sh"

# Check and install Node.js if needed
if ! command -v node &> /dev/null; then
    echo "📦 Установка Node.js..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "🍺 Установка Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH
        if [[ -f ~/.zshrc ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [[ -f ~/.bash_profile ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.bash_profile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
    fi
    
    # Install Node.js via Homebrew
    brew install node
    
    echo "✅ Node.js успешно установлен"
else
    echo "✅ Node.js уже установлен"
fi

# Check and install PostgreSQL if needed
if ! command -v psql &> /dev/null; then
    echo "🐘 Установка PostgreSQL..."
    brew install postgresql@15
    brew services start postgresql@15
    
    # Add PostgreSQL to PATH
    if [[ -f ~/.zshrc ]]; then
        echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
    elif [[ -f ~/.bash_profile ]]; then
        echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.bash_profile
    fi
    
    export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
    echo "✅ PostgreSQL успешно установлен"
else
    echo "✅ PostgreSQL уже установлен"
fi

# Install application dependencies
echo "📦 Установка зависимостей приложения..."
cd "$APP_DIR"
sudo npm install --production

# Setup database
echo "🗄️  Настройка базы данных..."

# Create database user and database
sudo -u postgres psql -c "CREATE USER airlab_user WITH PASSWORD 'airlab_password';" || true
sudo -u postgres psql -c "CREATE DATABASE airlab_db OWNER airlab_user;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE airlab_db TO airlab_user;" || true

# Set environment variables
echo "⚙️  Настройка переменных окружения..."
cat > "$APP_DIR/.env" << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://airlab_user:airlab_password@localhost:5432/airlab_db
PGHOST=localhost
PGPORT=5432
PGUSER=airlab_user
PGPASSWORD=airlab_password
PGDATABASE=airlab_db
OPENAI_API_KEY=your_openai_api_key_here
EOF

# Create desktop entry
echo "🖥️  Создание ярлыка приложения..."
cat > ~/Desktop/AirLab-Assistant-Builder.command << EOF
#!/bin/bash
cd "/Applications/AirLab-Assistant-Builder"
./start.sh
EOF

chmod +x ~/Desktop/AirLab-Assistant-Builder.command

# Create Applications folder entry
cat > "/Applications/AirLab-Assistant-Builder.app/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>start.sh</string>
    <key>CFBundleIdentifier</key>
    <string>com.initiology.airlab.assistant-builder</string>
    <key>CFBundleName</key>
    <string>Air Lab Assistant Builder</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>icon</string>
</dict>
</plist>
EOF

# Create app bundle structure
sudo mkdir -p "/Applications/AirLab-Assistant-Builder.app/Contents/MacOS"
sudo mkdir -p "/Applications/AirLab-Assistant-Builder.app/Contents/Resources"

# Create launcher script
cat > "/Applications/AirLab-Assistant-Builder.app/Contents/MacOS/start.sh" << EOF
#!/bin/bash
cd "/Applications/AirLab-Assistant-Builder"
open http://localhost:5000
./start.sh
EOF

sudo chmod +x "/Applications/AirLab-Assistant-Builder.app/Contents/MacOS/start.sh"

# Initialize database with demo data
echo "🔄 Инициализация базы данных..."
cd "$APP_DIR"
npm run db:push

echo ""
echo "✅ Установка завершена успешно!"
echo ""
echo "📋 Информация для входа:"
echo "   Администратор: admin / admin"
echo "   Лицензионный ключ: 0403198422061962"
echo ""
echo "🚀 Для запуска приложения:"
echo "   • Откройте приложение из папки Applications"
echo "   • Или используйте ярлык на рабочем столе"
echo "   • Приложение откроется в браузере по адресу: http://localhost:5000"
echo ""
echo "⚠️  Не забудьте настроить OpenAI API ключ в файле:"
echo "   $APP_DIR/.env"
echo ""
echo "==============================================="