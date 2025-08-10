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

# Ensure database exists and is initialized
echo "🗄️  Проверка базы данных..."
npm run db:push 2>/dev/null || echo "База данных уже готова"

# Build the application if needed
if [ ! -d "dist" ]; then
    echo "🔨 Сборка приложения..."
    npm run build
fi

echo "🌐 Запуск веб-сервера..."
echo "📱 Приложение будет доступно по адресу: http://localhost:5000"
echo "🔑 Администратор: admin / admin"
echo "🗝️  Лицензионный ключ: 0403198422061962"
echo ""
echo "⏳ Ожидание запуска сервера..."

# Start the application in background
NODE_ENV=production npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Сервер запущен успешно (PID: $SERVER_PID)"
    
    # Open browser
    open http://localhost:5000
    
    echo ""
    echo "🖥️  Приложение запущено!"
    echo "📝 Для остановки используйте: ./stop.sh"
    echo ""
    echo "Нажмите Ctrl+C для выхода из мониторинга сервера..."
    
    # Keep script running to monitor server
    wait $SERVER_PID
else
    echo "❌ Ошибка запуска сервера"
    exit 1
fi