#!/bin/bash

# Включаем вывод выполняемых команд для отладки
set -x

# Вывод информации о текущей директории
echo "Current directory: $(pwd)"
echo "Listing repository contents:"
ls -la

# Проверка наличия директории ios
if [ ! -d "ios" ]; then
  echo "Error: ios directory not found!"
  exit 1
fi

# Переход в директорию ios
cd ios
echo "Changed to ios directory: $(pwd)"
echo "Listing ios directory contents:"
ls -la

# Проверка наличия Podfile
if [ ! -f "Podfile" ]; then
  echo "Error: Podfile not found in ios directory!"
  exit 1
fi

# Обновление CocoaPods
echo "Updating CocoaPods..."
pod repo update

# Очистка кэша CocoaPods
echo "Cleaning CocoaPods cache..."
pod cache clean --all

# Удаление Pods директории, если она существует
if [ -d "Pods" ]; then
  echo "Removing existing Pods directory..."
  rm -rf Pods
fi

# Удаление Podfile.lock, если он существует
if [ -f "Podfile.lock" ]; then
  echo "Removing existing Podfile.lock..."
  rm -f Podfile.lock
fi

# Установка CocoaPods зависимостей с подробным выводом
echo "Installing CocoaPods dependencies..."
pod install --verbose

# Проверка успешности установки
if [ $? -ne 0 ]; then
  echo "Error: pod install failed!"
  exit 1
fi

# Проверка создания папки Pods
if [ ! -d "Pods" ]; then
  echo "Error: Pods directory was not created after pod install!"
  exit 1
fi

# Проверка наличия файла конфигурации
if [ ! -f "Pods/Target Support Files/Pods-Methoddo/Pods-Methoddo.release.xcconfig" ]; then
  echo "Error: Pods-Methoddo.release.xcconfig file was not created!"
  
  # Показать структуру директории Pods для отладки
  echo "Pods directory structure:"
  find Pods -type d | sort
  
  # Поиск xcconfig файлов
  echo "Looking for xcconfig files:"
  find Pods -name "*.xcconfig" | sort
  
  exit 1
fi

echo "CocoaPods installation completed successfully"
echo "Pods directory contents:"
ls -la Pods/Target\ Support\ Files/Pods-Methoddo/

# Возврат в корневую директорию проекта
cd ..
echo "Returned to root directory: $(pwd)"

# Отключаем вывод выполняемых команд
set +x 