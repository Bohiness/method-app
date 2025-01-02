// app/(tabs)/_layout.tsx
import { AddButton } from '@features/nav/bottom-menu/AddButton'
import { Colors } from '@shared/constants/colors'
import { useColorScheme } from '@shared/context/theme-provider'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Header } from '@widgets/nav/Header'
import { Tabs } from 'expo-router'
import { BarChart2, Compass, Home, ListChecks } from 'lucide-react-native'
import React from 'react'

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            height: 80,
            backgroundColor: Colors[colorScheme].background,
            borderTopWidth: 0,
            paddingBottom: 20,
            paddingHorizontal: 10,
          },
          tabBarActiveTintColor: Colors[colorScheme].text,
          tabBarInactiveTintColor: Colors[colorScheme].inactive,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'System',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="plans"
          options={{
            title: 'Plans',
            tabBarIcon: ({ color }) => <ListChecks size={24} color={color} />,
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
              // Ваша логика при нажатии на кнопку
            },
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="trends"
          options={{
            title: 'Trends',
            tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
          }}
        />
      </Tabs>
    </>
  )
}