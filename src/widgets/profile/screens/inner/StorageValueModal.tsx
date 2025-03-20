import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface StorageValueModalProps {
    storageKey: string
    value: string
    size: number
}

type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'key' | 'error' | 'encrypted'

interface StyledJsonLineProps {
    content: string
    type: JsonValueType
    indentLevel?: number
}

const StyledJsonLine = ({ content, type, indentLevel = 0 }: StyledJsonLineProps) => {
    const getColorForType = (type: JsonValueType): string => {
        switch (type) {
            case 'string':
                return 'text-tint dark:text-tint-dark'
            case 'number':
                return 'text-success dark:text-success-dark'
            case 'boolean':
                return 'text-warning dark:text-warning-dark'
            case 'null':
                return 'text-error dark:text-error-dark'
            case 'key':
                return 'text-text dark:text-text-dark font-bold'
            case 'error':
                return 'text-error dark:text-error-dark'
            case 'encrypted':
                return 'text-warning dark:text-warning-dark'
            default:
                return 'text-text dark:text-text-dark'
        }
    }

    return (
        <Text
            className={`font-mono ${getColorForType(type)}`}
            style={{ marginLeft: indentLevel * 16 }}
        >
            {content}
        </Text>
    )
}

export const StorageValueModal = ({ storageKey, value, size }: StorageValueModalProps) => {
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()

    const isEncrypted = value === '[Encrypted Value]'

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    // Форматирование JSON с подсветкой синтаксиса
    const formattedLines = useMemo(() => {

        if (isEncrypted) {
            return [{
                content: t('settings.storage.encryptedValue'),
                type: 'encrypted' as JsonValueType,
                indentLevel: 0
            }]
        }

        try {
            const parsedValue = JSON.parse(value)
            const lines: Array<{ content: string; type: JsonValueType; indentLevel: number }> = []

            const processValue = (val: any, indent: number, isLastItem: boolean): void => {
                if (val === null) {
                    lines.push({ content: 'null' + (isLastItem ? '' : ','), type: 'null', indentLevel: indent })
                } else if (typeof val === 'boolean') {
                    lines.push({ content: String(val) + (isLastItem ? '' : ','), type: 'boolean', indentLevel: indent })
                } else if (typeof val === 'number') {
                    lines.push({ content: String(val) + (isLastItem ? '' : ','), type: 'number', indentLevel: indent })
                } else if (typeof val === 'string') {
                    lines.push({ content: `"${val}"` + (isLastItem ? '' : ','), type: 'string', indentLevel: indent })
                } else if (Array.isArray(val)) {
                    lines.push({ content: '[', type: 'key', indentLevel: indent })
                    val.forEach((item, index) => {
                        processValue(item, indent + 1, index === val.length - 1)
                    })
                    lines.push({ content: ']' + (isLastItem ? '' : ','), type: 'key', indentLevel: indent })
                } else if (typeof val === 'object') {
                    lines.push({ content: '{', type: 'key', indentLevel: indent })
                    const entries = Object.entries(val)
                    entries.forEach(([key, value], index) => {
                        lines.push({
                            content: `"${key}": `,
                            type: 'key',
                            indentLevel: indent + 1
                        })
                        processValue(value, indent + 1, index === entries.length - 1)
                    })
                    lines.push({ content: '}' + (isLastItem ? '' : ','), type: 'key', indentLevel: indent })
                }
            }

            processValue(parsedValue, 0, true)
            return lines
        } catch (error) {
            return [{
                content: value,
                type: 'string' as JsonValueType,
                indentLevel: 0
            }]
        }
    }, [value])

    return (
        <View
            variant="default"
            className="flex-1"
            style={{
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left + 16,
                paddingRight: insets.right + 16
            }}
        >
            {/* Заголовок и информация */}
            <View className="mb-4">
                <Text size="lg" weight="bold" className="mb-1">
                    {storageKey}
                </Text>
                <View className="flex-row items-center space-x-2">
                    <View className="flex-row items-center">
                        <Icon name="Database" size={16} className="mr-2" variant="secondary" />
                        <Text variant="secondary" size="sm">
                            {formatSize(size)}
                        </Text>
                    </View>
                    {isEncrypted && (
                        <View className="flex-row items-center">
                            <Icon name="Lock" size={16} className="mr-2" variant="warning" />
                            <Text variant="warning" size="sm">
                                {t('settings.storage.encrypted')}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Значение */}
            <View className="flex-1 rounded-lg p-4">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {formattedLines.map((line, index) => (
                        <StyledJsonLine
                            key={`${index}-${line.content}`}
                            content={line.content}
                            type={line.type}
                            indentLevel={line.indentLevel}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    )
}