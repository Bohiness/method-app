## Запуск приложения в режиме разработки

npx expo start --clear

## Сборка приложения в режиме превью (для iOS) через EAS

eas build --platform ios --profile preview

## Сборка приложения в режиме разработки (для iOS) через EAS

eas build --profile development --platform ios expo start --dev-client

# Создаем нативные файлы

## Для локальной сборки

# Создаем нативные файлы

npx expo prebuild

# Или если нужно пересоздать

npx expo prebuild --clean

# Переходим в ios директорию

cd ios

# Устанавливаем зависимости через CocoaPods

pod install

# Открываем проект в Xcode

# Внутри Xcode выбираем проект и выполняем сборку

open yourproject.xcworkspace

# Запускаем dev client

npx expo start --dev-client

# Сборка и отправка в App Store Connect

eas build --platform ios\

eas submit --platform ios

# Сборка локально

eas build --local

# Удаляем Pods и Podfile.lock

cd ios

rm -rf Pods Podfile.lock

pod install --verbose

cd ..
