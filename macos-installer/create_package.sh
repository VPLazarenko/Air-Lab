#!/bin/bash

# Air Lab Assistant Builder - Package Creator for Mac OS

echo "📦 Создание установочного пакета для Mac OS..."

# Create icon from existing logo
cp ../attached_assets/лого3_1754808405274.jpg ./app/icon.png

# Make scripts executable
chmod +x install.sh
chmod +x app/start.sh
chmod +x app/stop.sh

# Create ZIP package
echo "🗜️  Создание ZIP архива..."
zip -r "AirLab-Assistant-Builder-MacOS.zip" . -x "*.DS_Store" "create_package.sh"

echo "✅ Пакет создан: AirLab-Assistant-Builder-MacOS.zip"
echo "📁 Размер пакета: $(du -h AirLab-Assistant-Builder-MacOS.zip | cut -f1)"