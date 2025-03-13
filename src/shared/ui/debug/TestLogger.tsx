import { logger } from '@shared/lib/logger/logger.service'

export function TestLoggerComponent() {

    // В любом месте приложения
    async function testLogger() {
        // Проверяем состояние транспортов
        const states = await logger.checkTransportsState()
        console.log('Logger states:', JSON.stringify(states, null, 2))

        // Пишем тестовый лог
        logger.log('Test message', 'TestContext')

        // Проверяем содержимое файла
        const content = await logger.getFileLogContent()
        console.log('Log file after write:', content)
    }

    testLogger()

    return null
}