// src/features/nav/bottom-menu/AddButtonMenu.tsx
import { BlurredScreenBackground } from '@entities/modals/blurred-screen-background'
import { APP_ROUTES } from '@shared/constants/system/app-routes'
import { useAddMenu } from '@shared/context/add-menu-context'
import { QuickAccessOption, useAppSettings } from '@shared/context/app-settings-context'
import { useTheme } from '@shared/context/theme-provider'
import { useJournal } from '@shared/hooks/diary/journal/useJournal'
import { useMoodCheckin } from '@shared/hooks/diary/mood/useMoodCheckin'
import { AppActivityKey, useAppActivities } from '@shared/hooks/systems/useAppActivity'
import { logger } from '@shared/lib/logger/logger.service'
import { Icon, IconName } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Dimensions, Pressable, ScrollView, StyleProp, ViewStyle } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const AddButtonMenu = () => {
    const { isVisible, hide, currentTab } = useAddMenu()
    const { t } = useTranslation()
    const { height: screenHeight } = Dimensions.get('window')
    const { openMoodCheckinModal } = useMoodCheckin()
    const { openJournalModal } = useJournal()
    const insets = useSafeAreaInsets()
    const { theme } = useTheme()
    const { quickAccess } = useAppSettings()
    const actionMap = useAppActivities()

    const { options: userScrollableOptions, isLoading, error } = quickAccess

    const menuAnimatedStyle = useAnimatedStyle(() => {
        const isVisibleValue = isVisible ? 1 : 0
        return {
            opacity: withTiming(isVisibleValue, {
                duration: 200,
                easing: Easing.ease,
            }),
            transform: [
                {
                    scale: withSpring(isVisible ? 1 : 0, {
                        mass: 0.7,
                        damping: 15,
                        stiffness: 150,
                    }),
                },
                {
                    translateY: withSpring(isVisible ? 0 : 80, {
                        mass: 0.7,
                        damping: 15,
                        stiffness: 150,
                    }),
                },
            ],
        }
    })

    const overlayStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isVisible ? 1 : 0, {
                duration: 250,
                easing: Easing.ease,
            }),
            pointerEvents: isVisible ? 'auto' : 'none',
        }
    })

    if (currentTab === 'plans') {
        return null
    }

    // Обработчик нажатия теперь принимает key
    const handleScrollableOptionPress = (optionKey: AppActivityKey) => {
        logger.info(`Handling scrollable option press for key: ${optionKey}`)
        hide()
        const action = actionMap[optionKey]
        if (action) {
            action.action()
        } else {
            logger.warn(`Action not found for quick access option key: ${optionKey}`)
        }
    }

    const cardOptions: Array<{
        id: string
        icon: IconName
        title: string
        onPress?: () => void
    }> = [
            {
                id: actionMap.startDay.key,
                icon: actionMap.startDay.icon,
                title: actionMap.startDay.titleKey,
                onPress: () => {
                    hide()
                    actionMap.startDay.action()
                },
            },
            {
                id: actionMap.journalNewEntry.key,
                icon: actionMap.journalNewEntry.icon,
                title: actionMap.journalNewEntry.titleKey,
                onPress: () => {
                    hide()
                    actionMap.journalNewEntry.action()
                },
            },
            {
                id: actionMap.mood.key,
                icon: actionMap.mood.icon,
                title: actionMap.mood.titleKey,
                onPress: () => {
                    hide()
                    actionMap.mood.action()
                },
            },
        ]

    const BUTTON_HEIGHT = 64
    const BUTTON_BOTTOM_MARGIN = 10
    const MENU_BUTTON_SPACING = 0

    if (isLoading) {
        return null
    }

    if (error) {
        console.error("Error loading quick access options:", error)
    }

    // Определяем стили для контейнера ScrollView
    const scrollContentStyle: StyleProp<ViewStyle> = {
        paddingHorizontal: 10, // Базовый отступ
        ...(userScrollableOptions.length === 0 && { // Добавляем стили, если массив пуст
            flexGrow: 1,
            justifyContent: 'center' as const,
        }),
    }

    return (
        <>
            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    height: screenHeight,
                    zIndex: 999,
                    pointerEvents: isVisible ? 'auto' : 'none',
                }}
            >
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                        },
                        overlayStyle,
                    ]}
                >
                    <BlurView
                        intensity={10}
                        tint={theme === 'dark' ? 'dark' : 'light'}
                        style={{
                            flex: 1,
                        }}
                    >
                        <Pressable
                            style={{ flex: 1 }}
                            onPress={hide}
                        />
                    </BlurView>
                </Animated.View>

                <Animated.View
                    style={[
                        menuAnimatedStyle,
                        {
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: insets.bottom + BUTTON_BOTTOM_MARGIN + BUTTON_HEIGHT + MENU_BUTTON_SPACING,
                            alignItems: 'center',
                            pointerEvents: isVisible ? 'auto' : 'none',
                        },
                    ]}
                >
                    <BlurredScreenBackground intensity={80} className="pt-5 pb-8 rounded-[30px] w-[90%]">
                        {/* Верхний блок */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-8 pt-6"
                            contentContainerStyle={scrollContentStyle}
                        >
                            {userScrollableOptions.map((option: QuickAccessOption) => (
                                <Pressable
                                    key={option.id}
                                    className="items-center mx-3"
                                    onPress={() => handleScrollableOptionPress(option.key)}
                                >
                                    <View variant="paper" className="w-16 h-16 rounded-full items-center justify-center mb-2">
                                        <Icon name={option.icon} size={28} variant="secondary" />
                                    </View>
                                    <Text size="xs" align="center" variant="secondary" numberOfLines={2}>
                                        {t(option.titleKey)}
                                    </Text>
                                </Pressable>
                            ))}

                            <Pressable
                                key="add"
                                className="items-center mx-3"
                                onPress={() => router.push(`/${APP_ROUTES.MODALS.SETTINGS.QUICK_ACCESS}`)}
                            >
                                <View
                                    variant="paper"
                                    className={`
                                        ${userScrollableOptions.length === 0 ? 'w-20 h-20' : 'w-16 h-16'}
                                        rounded-full items-center justify-center mb-2
                                    `}
                                >
                                    <Icon
                                        name="Plus"
                                        size={userScrollableOptions.length === 0 ? 32 : 28}
                                        variant="secondary"
                                    />
                                </View>
                                <Text
                                    size={userScrollableOptions.length === 0 ? 'sm' : 'xs'}
                                    align="center"
                                    variant="secondary"
                                    numberOfLines={2}
                                >
                                    {t('common.add')}
                                </Text>
                            </Pressable>
                        </ScrollView>

                        {/* Нижний блок */}
                        <View className="flex-row justify-between mx-3">
                            {cardOptions.map((option) => (
                                <Pressable
                                    key={option.id}
                                    onPress={option.onPress}
                                    className="flex-1 mx-1"
                                >
                                    <View
                                        variant={option.id === actionMap.journal.key ? 'canvas' : 'paper'}
                                        className="rounded-3xl items-center justify-center py-10 gap-y-4 flex-grow"
                                    >
                                        <Icon
                                            name={option.icon}
                                            size={28}
                                            variant={'secondary'}
                                        />
                                        <Text
                                            size="sm"
                                            align="center"
                                            variant={'secondary'}
                                        >
                                            {t(option.title)}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </BlurredScreenBackground>
                </Animated.View>
            </Animated.View>
        </>
    )
}