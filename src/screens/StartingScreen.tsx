import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { RootStackNavigationProp, RootStackParamList } from '../navigators/RootNavigator';
import { themeColors } from '../utils/Theme';
import { FeedStackParamList } from '../navigators/FeedStackNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'



export default function StartingScreen() {
  const navigation = useNavigation<RootStackNavigationProp>()

  const onGetStarted = () => {
    navigation.navigate("CreateAccount")
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
        />

        {/* Scrolis Text */}
        <Text style={styles.brandName}>Scrolis</Text>

        {/* Main Heading */}
        <Text style={styles.heading}>See the full picture</Text>

        {/* Description */}
        <Text style={styles.description}>
          A daily digest built from your timeline — balanced, finite, and free from the algorithm.
        </Text>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomSection}>
        <Pressable
          style={styles.primaryButton}
          onPress={onGetStarted}
        >
          <Text style={styles.primaryButtonText}>Get started</Text>
        </Pressable>

        <Pressable
        //   onPress={() => navigation.navigate("Login", {})}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 30,
    fontWeight: '600',
    color: themeColors.textPrimary,
    marginBottom: 48,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: themeColors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  bottomSection: {
    marginBottom: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: themeColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: themeColors.primary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
