#!/bin/bash

# Air Lab Assistant Builder - Quick Launch Script
# Mac OS Version

echo "🚀 Air Lab Assistant Builder"
echo "AI Platform by Initiology AI Systems"
echo "=================================="

# Navigate to installation directory
cd "/Applications/AirLab-Assistant-Builder" 2>/dev/null || {
    echo "❌ Приложение не установлено"
    echo "📥 Запустите install.sh для установки"
    exit 1
}

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "🐘 Запуск PostgreSQL..."
    brew services start postgresql@15
    sleep 2
fi

# Quick database check
npm run db:push >/dev/null 2>&1

echo "🌐 Запуск веб-сервера на http://localhost:5000"
echo "🔑 Админ: admin / admin"
echo "📝 Лицензия: 0403198422061962"
echo ""

# Start in development mode (hot reload enabled)
NODE_ENV=development npm run dev &
SERVER_PID=$!

# Open browser after short delay
sleep 3
open http://localhost:5000

echo "✅ Приложение запущено! (PID: $SERVER_PID)"
echo "🛑 Для остановки: нажмите Ctrl+C"
echo ""

# Wait for server process
wait $SERVER_PID