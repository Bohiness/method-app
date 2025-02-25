// app/(tabs)/_layout.tsx
import { PlansSettingsHeaderButton } from '@entities/navigations/PlansSettingsHeaderButton'
import { UserHeaderButton } from '@entities/navigations/UserHeaderButton'
import { AddButton } from '@features/nav/bottom-menu/AddButton'
import { AddButtonMenu } from '@features/nav/bottom-menu/AddButtonMenu'
import { Colors } from '@shared/constants/colors'
import { AddMenuProvider, useAddMenu } from '@shared/context/add-menu-context'
import { useColorScheme } from '@shared/context/theme-provider'
import { getDateText } from '@shared/lib/calendar/getDateText'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { CustomHeader } from '@widgets/navigation/CustomHeader'
import { Tabs, usePathname } from 'expo-router'
import { t } from 'i18next'
import { BarChart2, Compass, Home, ListChecks } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function TabNavigator() {
  const colorScheme = useColorScheme()
  const theme = colorScheme ?? 'light'
  const insets = useSafeAreaInsets()
  const { setCurrentTab } = useAddMenu()
  const pathname = usePathname()

  const TAB_BAR_HEIGHT = 45

  useEffect(() => {
    // Извлекаем имя текущей вкладки из пути
    const currentTab = pathname.split('/').pop() || 'index'
    setCurrentTab(currentTab)
  }, [pathname, setCurrentTab])

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            backgroundColor: Colors[theme].background,
            borderTopWidth: 0,
            paddingHorizontal: 10,
            paddingBottom: insets.bottom,
          },
          tabBarItemStyle: {
            height: TAB_BAR_HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
          },
          tabBarActiveTintColor: Colors[theme].text,
          tabBarInactiveTintColor: Colors[theme].inactive,
        }}>
        <Tabs.Screen
          name="index"
          options={({ route }: { route: { params?: { selectedDate?: Date } } }) => {
            const currentDate = route.params?.selectedDate || new Date()
            return {
              title: 'Today',
              tabBarIcon: ({ color }) => <Home size={24} color={color} />,
              headerShown: true,
              header: () => (
                <CustomHeader
                  rightElement={<UserHeaderButton />}
                  title={`${getDateText(currentDate)}.`}
                  titleAlign='center'
                />
              ),
            }
          }}
        />
        <Tabs.Screen
          name="plans"
          options={{
            title: 'Plans',
            tabBarIcon: ({ color }) => <ListChecks size={24} color={color} />,
            headerShown: true,
            header: () => (
              <CustomHeader
                title={t('plans.title')}
                titleAlign='center'
                rightElement={<PlansSettingsHeaderButton />}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarButton: () => <AddButton />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
            },
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
            headerShown: true,
            header: () => (
              <CustomHeader
                title={t('explore.title')}
                titleAlign='center'
                rightElement={<UserHeaderButton />}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="threads"
          options={{
            title: 'Threads',
            tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
            headerShown: true,
            header: () => (
              <CustomHeader
                title={t('threads.title')}
                titleAlign='center'
                rightElement={<UserHeaderButton />}
              // leftElement={<StreakHeaderButton />}
              />
            ),
          }}
        />
      </Tabs>
      <AddButtonMenu />
    </View>
  )
}

export default function TabLayout() {
  return (
    <AddMenuProvider>
      <TabNavigator />
    </AddMenuProvider>
  )
}