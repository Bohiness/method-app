// app/(tabs)/_layout.tsx
import { AddButton } from '@features/nav/bottom-menu/AddButton'
import { useColorScheme } from '@hooks/systems/colors/useColorScheme'
import { Colors } from '@shared/constants/colors'
import { HapticTab } from '@shared/ui/system/HapticTab'
import { Text } from '@ui/styled-text'
import { Header } from '@widgets/nav/Header'
import { Tabs } from 'expo-router'
import { BarChart3, Bed, BookOpen, View } from 'lucide-react-native'
import React from 'react'

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light'

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
          tabBarActiveTintColor: Colors[colorScheme].tint,
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
            tabBarIcon: ({ color }) => <Bed size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
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
          name="journey"
          options={{
            title: 'Journey',
            tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="trends"
          options={{
            title: 'Trends',
            tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
            // Кастомный контент для Header
            headerLeft: () => (
              <View>
                <Text>Статистика</Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  )
}