#!/bin/bash

# Переход в директорию ios
cd ios

# Установка CocoaPods зависимостей
pod install

# Вывод информации о результате
echo "CocoaPods installation completed"

# Возврат в корневую директорию проекта
cd .. 