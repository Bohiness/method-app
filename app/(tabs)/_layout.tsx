// app/(tabs)/_layout.tsx
import { PlansSettingsHeaderButton } from '@entities/navigations/PlansSettingsHeaderButton'
import { UserHeaderButton } from '@entities/navigations/UserHeaderButton'
import { AddButton } from '@features/nav/bottom-menu/AddButton'
import { AddButtonMenu } from '@features/nav/bottom-menu/AddButtonMenu'
import { AddMenuProvider, useAddMenu } from '@shared/context/add-menu-context'
import { useTheme } from '@shared/context/theme-provider'
import { getDateText } from '@shared/lib/calendar/getDateText'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { CustomHeader } from '@widgets/navigation/CustomHeader'
import { Tabs, usePathname } from 'expo-router'
import { t } from 'i18next'
import { BarChart2, Compass, Home, ListChecks } from 'lucide-react-native'
import { useEffect } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function TabNavigator() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { setCurrentTab } = useAddMenu()
  const pathname = usePathname()

  const TAB_BAR_HEIGHT = 50

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
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            backgroundColor: colors.background,
            borderTopWidth: 0,
            paddingHorizontal: 10,
            paddingBottom: insets.bottom,
          },
          tabBarItemStyle: {
            height: TAB_BAR_HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 5,
          },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.inactive,
          tabBarLabelStyle: {
            marginTop: 3,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={({ route }: { route: { params?: { selectedDate?: Date } } }) => {
            const currentDate = route.params?.selectedDate || new Date()
            return {
              title: 'Today',
              tabBarIcon: ({ color }) => <Home size={28} color={color} />,
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
            tabBarIcon: ({ color }) => <ListChecks size={28} color={color} />,
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
            tabBarButton: () => null,
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
            tabBarIcon: ({ color }) => <Compass size={28} color={color} />,
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
            tabBarIcon: ({ color }) => <BarChart2 size={28} color={color} />,
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
      <AddButton />
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