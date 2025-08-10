#!/bin/bash

# Air Lab Assistant Builder - Startup Script
# Mac OS Version

APP_DIR="/Applications/AirLab-Assistant-Builder"
cd "$APP_DIR"

echo "🚀 Запуск Air Lab Assistant Builder..."

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "🐘 Запуск PostgreSQL..."
    brew services start postgresql@15
    sleep 3
fi

# Start the application
echo "🌐 Запуск веб-сервера..."
echo "📱 Приложение будет доступно по адресу: http://localhost:5000"
echo "🔑 Администратор: admin / admin"
echo "🗝️  Лицензионный ключ: 0403198422061962"

# Open browser
open http://localhost:5000

# Start Node.js application
NODE_ENV=production npm start

echo "✅ Air Lab Assistant Builder успешно запущен!"