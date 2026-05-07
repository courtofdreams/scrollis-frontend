// components/Button.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { themeColors } from '../utils/Theme'

export default function PrimaryButton({ title, onPress, loading, isDisabled, height }: any) {
  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled, { height }]}
      onPress={onPress}
      disabled={loading || isDisabled}
    >
      <Text style={[styles.text, isDisabled && styles.textDisabled]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColors.primary,
		fontSize: 16,
    borderRadius: 18,
		fontWeight: '700',
    alignItems: 'center',
		justifyContent: 'center',
  },
  text: {
    color: themeColors.textWhite,
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: themeColors.buttonDisabled,
  },
  textDisabled: {
    color: themeColors.buttonDisabledText,
  },
})