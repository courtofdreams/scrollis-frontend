import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'

export type TabKey = 'feed' | 'explore' | 'search' | 'profile'

type BottomMenuProps = {
  activeTab: TabKey
  onChangeTab: (tab: TabKey) => void
}

const PRIMARY = '#5448B7'
const MUTED = '#667085'
const BORDER = '#E6E8EC'

export default function BottomMenu({
  activeTab,
  onChangeTab,
}: BottomMenuProps) {
  const renderTab = (
    key: TabKey,
    label: string,
    icon: React.ReactNode
  ) => {
    const isActive = activeTab === key

    return (
      <TouchableOpacity
        onPress={() => onChangeTab(key)}
        style={isActive ? styles.navItemActive : styles.navItem}
      >
        {icon}
        <Text style={isActive ? styles.navTextActive : styles.navText}>
          {label}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.bottomNav}>
      {renderTab(
        'feed',
        'Feed',
        <Ionicons
          name="home-outline"
          size={24}
          color={activeTab === 'feed' ? PRIMARY : MUTED}
        />
      )}

      {renderTab(
        'explore',
        'Explore',
        <MaterialCommunityIcons
          name="compass-outline"
          size={24}
          color={activeTab === 'explore' ? PRIMARY : MUTED}
        />
      )}

      {renderTab(
        'search',
        'Search',
        <Feather
          name="search"
          size={24}
          color={activeTab === 'search' ? PRIMARY : MUTED}
        />
      )}

      {renderTab(
        'profile',
        'Profile',
        <Ionicons
          name="person-outline"
          size={24}
          color={activeTab === 'profile' ? PRIMARY : MUTED}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    backgroundColor: '#fff',
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minWidth: 64,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minWidth: 76,
    backgroundColor: '#EFECFF',
    borderRadius: 18,
    paddingHorizontal: 14,
  },
  navText: {
    marginTop: 6,
    fontSize: 14,
    color: MUTED,
    fontWeight: '600',
  },
  navTextActive: {
    marginTop: 6,
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '700',
  },
})