import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.subtitle}>
        This is the Explore screen. Add diverse viewpoints, discovery topics,
        or recommendation sections here.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#182033',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    color: '#667085',
  },
})