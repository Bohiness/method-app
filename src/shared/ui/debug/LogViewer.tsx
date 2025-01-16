// src/shared/ui/debug/LogViewer.tsx

import { logger } from '@shared/lib/logger/logger.service'
import React, { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Button } from '../button'
import { Text } from '../text'

export function LogViewer() {
    const [logs, setLogs] = useState<string>('')
    const [stats, setStats] = useState<any>(null)

    const loadLogs = async () => {
        const content = await logger.getFileLogContent()
        const states = await logger.checkTransportsState()
        setLogs(content)
        setStats(states)
    }

    useEffect(() => {
        loadLogs()
        const interval = setInterval(loadLogs, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <View className="flex-1">
            <ScrollView className="flex-1 p-4">
                <Text className="font-bold mb-2">Logger Stats:</Text>
                <Text className="font-mono text-xs mb-4">
                    {JSON.stringify(stats, null, 2)}
                </Text>

                <Text className="font-bold mb-2">Logs:</Text>
                <Text className="font-mono text-xs">{logs}</Text>
            </ScrollView>

            <Button onPress={loadLogs}>
                Refresh Logs
            </Button>
        </View>
    )
}
