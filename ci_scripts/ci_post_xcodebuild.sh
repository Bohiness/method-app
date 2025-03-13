#!/bin/bash

# Включаем вывод выполняемых команд для отладки
set -x

echo "Running post-xcodebuild script"
echo "Current directory: $(pwd)"

# Проверка наличия директории ios
if [ -d "ios" ]; then
  cd ios
  echo "Changed to ios directory: $(pwd)"
  
  # Проверка наличия файла конфигурации
  if [ -f "Pods/Target Support Files/Pods-Methoddo/Pods-Methoddo.release.xcconfig" ]; then
    echo "Pods-Methoddo.release.xcconfig exists:"
    cat "Pods/Target Support Files/Pods-Methoddo/Pods-Methoddo.release.xcconfig"
  else
    echo "Pods-Methoddo.release.xcconfig does not exist"
    
    # Показать структуру директории Pods для отладки
    if [ -d "Pods" ]; then
      echo "Pods directory structure:"
      find Pods -type d | sort
      
      # Поиск xcconfig файлов
      echo "Looking for xcconfig files:"
      find Pods -name "*.xcconfig" | sort
    else
      echo "Pods directory does not exist"
    fi
  fi
  
  cd ..
fi

echo "Post-xcodebuild script completed"

# Отключаем вывод выполняемых команд
set +x 