#!/bin/bash

# Включаем вывод выполняемых команд для отладки
set -x

echo "Running pre-xcodebuild script"
echo "Current directory: $(pwd)"

# Проверка наличия директории ios
if [ ! -d "ios" ]; then
  echo "Error: ios directory not found!"
  exit 1
fi

# Переход в директорию ios
cd ios
echo "Changed to ios directory: $(pwd)"

# Проверка наличия xcworkspace
if [ ! -d "Methoddo.xcworkspace" ]; then
  echo "Error: Methoddo.xcworkspace not found!"
  exit 1
fi

# Проверка наличия папки Pods
if [ ! -d "Pods" ]; then
  echo "Error: Pods directory not found! Running pod install again..."
  pod install --verbose
  
  if [ ! -d "Pods" ]; then
    echo "Error: Pods directory still not created after pod install!"
    exit 1
  fi
fi

# Проверка наличия файла конфигурации
if [ ! -f "Pods/Target Support Files/Pods-Methoddo/Pods-Methoddo.release.xcconfig" ]; then
  echo "Error: Pods-Methoddo.release.xcconfig file not found!"
  
  # Показать структуру директории Pods для отладки
  echo "Pods directory structure:"
  find Pods -type d | sort
  
  # Поиск xcconfig файлов
  echo "Looking for xcconfig files:"
  find Pods -name "*.xcconfig" | sort
  
  # Попробуем создать файл вручную, если его нет
  mkdir -p "Pods/Target Support Files/Pods-Methoddo"
  
  # Создаем базовый xcconfig файл, если его нет
  if [ ! -f "Pods/Target Support Files/Pods-Methoddo/Pods-Methoddo.release.xcconfig" ]; then
    echo "Creating basic Pods-Methoddo.release.xcconfig file..."
    cat > "Pods/Target Support Files/Pods-Methoddo/Pods-Methoddo.release.xcconfig" << EOF
// This is a basic configuration file created by ci_pre_xcodebuild.sh
// It may not contain all necessary settings, but should allow the build to proceed
FRAMEWORK_SEARCH_PATHS = \$(inherited)
HEADER_SEARCH_PATHS = \$(inherited)
OTHER_CFLAGS = \$(inherited)
OTHER_LDFLAGS = \$(inherited)
PODS_BUILD_DIR = \${BUILD_DIR}
PODS_CONFIGURATION_BUILD_DIR = \${PODS_BUILD_DIR}/\$(CONFIGURATION)\$(EFFECTIVE_PLATFORM_NAME)
PODS_PODFILE_DIR_PATH = \${SRCROOT}/.
PODS_ROOT = \${SRCROOT}/Pods
USE_RECURSIVE_SCRIPT_INPUTS_IN_SCRIPT_PHASES = YES
EOF
  fi
fi

echo "Pre-xcodebuild checks completed"

# Возврат в корневую директорию проекта
cd ..
echo "Returned to root directory: $(pwd)"

# Отключаем вывод выполняемых команд
set +x 