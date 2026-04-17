// src/navigation/MainTabs.tsx
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import FeedStackNavigator from '../navigators/FeedStackNavigator'
import ExploreStackNavigator from '../navigators/ExploreStackNavigator'
import SearchScreen from './SearchScreen'
import ProfileScreen from './ProfileScreen'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native';



const Tab = createBottomTabNavigator()

export default function MainTabs() {
  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 5,
            height: 70,
            borderRadius: 20,
            paddingTop: 10,
            // paddingBottom: 20,
            borderColor: 'transparent',
            backgroundColor: '#fff',
            marginBottom: '0.5%',
            width: '90%',
            left: 0,
            right: 0,
            marginHorizontal: '5%', // 100% - 90% = 10% / 2
            boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.09)',
          },

          tabBarActiveTintColor: '#1100ad',
          tabBarInactiveTintColor: '#667085',
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'FeedTab') {
              return <Ionicons name="home-outline" size={size} color={color} />
            }
            if (route.name === 'ExploreTab') {
              return (
                <MaterialCommunityIcons
                  name="compass-outline"
                  size={size}
                  color={color}
                />
              )
            }
            if (route.name === 'SearchTab') {
              return <Feather name="search" size={size} color={color} />
            }
            return <Ionicons name="person-outline" size={size} color={color} />
          },
        })}
      >
        <Tab.Screen
          name="FeedTab"
          component={FeedStackNavigator}
          options={{ title: 'Feed' }}
        />
        <Tab.Screen
          name="ExploreTab"
          component={ExploreStackNavigator}
          options={{ title: 'Explore' }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchScreen}
          options={{ title: 'Search' }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  text: {
    fontSize: 25,
    fontWeight: '500',
  },
});
