// components/Button.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

export default function TwitterButton({ onPress, loading, isAuthenticated }: any) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading || isAuthenticated}
    >
      <Text style={styles.text}>
        {loading ? 'Loading...' : isAuthenticated ? 'Connected' : 'Login with X'}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
})