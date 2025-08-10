#!/bin/bash

# Air Lab Assistant Builder - Stop Script
# Mac OS Version

echo "🛑 Остановка Air Lab Assistant Builder..."

# Kill Node.js processes
pkill -f "node.*server/index.ts"
pkill -f "tsx.*server/index.ts" 

echo "✅ Air Lab Assistant Builder остановлен"