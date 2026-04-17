import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Pressable,
	ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { themeColors } from '../utils/Theme';
import { SafeAreaView } from 'react-native-safe-area-context'
import { RootStackNavigationProp } from '../navigators/RootNavigator';


export default function CreateAccountScreen() {
	const navigation = useNavigation<RootStackNavigationProp>();
	const [fullName, setFullName] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Pressable
					onPress={() => {
						if (navigation.canGoBack()) {
							navigation.goBack();
							return;
						}
						navigation.navigate('Starting');
					}}
					hitSlop={12}
					style={styles.backButton}
				>
					<Feather name="chevron-left" size={28} color={themeColors.textPrimary} />
				</Pressable>

				<Text style={styles.title}>Create your account</Text>
				<Text style={styles.subtitle}>Takes less than a minute.</Text>

				<View style={styles.formGroup}>
					<Text style={styles.label}>Full name</Text>
					<TextInput
						value={fullName}
						onChangeText={setFullName}
						placeholder="Jane Doe"
						placeholderTextColor={themeColors.textSecondary}
						style={styles.input}
					/>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.label}>Username</Text>
					<TextInput
						value={username}
						onChangeText={setUsername}
						placeholder="jane@example.com"
						placeholderTextColor={themeColors.textSecondary}
						style={styles.input}
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.label}>Email address</Text>
					<TextInput
						value={email}
						onChangeText={setEmail}
						placeholder="jane@example.com"
						placeholderTextColor={themeColors.textSecondary}
						style={styles.input}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.label}>Password</Text>
					<TextInput
						value={password}
						onChangeText={setPassword}
						placeholder="••••••••"
						placeholderTextColor={themeColors.textSecondary}
						style={styles.input}
						secureTextEntry
					/>
				</View>

				<Pressable style={styles.primaryButton}>
					<Text style={styles.primaryButtonText}>Continue</Text>
				</Pressable>

				<View style={styles.dividerRow}>
					<View style={styles.dividerLine} />
					<Text style={styles.dividerText}>or</Text>
					<View style={styles.dividerLine} />
				</View>

				<Pressable style={styles.googleButton}>
					<Feather name="chrome" size={22} color={themeColors.textPrimary} />
					<Text style={styles.googleButtonText}>Sign up with Google</Text>
				</Pressable>

				<Text style={styles.termsText}>
					By continuing, you agree to our Terms and Privacy Policy.
				</Text>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: themeColors.background,
	},
	content: {
		paddingHorizontal: 32,
		paddingTop: 18,
		paddingBottom: 28,
	},
	backButton: {
		alignSelf: 'flex-start',
		marginBottom: 10,
	},
	title: {
		fontSize: 34,
		fontWeight: '700',
		color: themeColors.textPrimary,
		lineHeight: 40,
	},
	subtitle: {
		marginTop: 10,
		marginBottom: 22,
		fontSize: 20,
		lineHeight: 26,
		color: themeColors.textPrimary,
	},
	formGroup: {
		marginBottom: 18,
	},
	label: {
		marginBottom: 10,
		fontSize: 17,
		fontWeight: '600',
		color: themeColors.textPrimary,
	},
	input: {
		height: 56,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: 'rgba(26, 26, 46, 0.12)',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 18,
		fontSize: 18,
		color: themeColors.textPrimary,
	},
	primaryButton: {
		marginTop: 6,
		height: 64,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: themeColors.primary,
	},
	primaryButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '700',
	},
	dividerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 22,
		marginBottom: 22,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: 'rgba(26, 26, 46, 0.10)',
	},
	dividerText: {
		marginHorizontal: 12,
		fontSize: 18,
		color: themeColors.textSecondary,
	},
	googleButton: {
		height: 64,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: 'rgba(26, 26, 46, 0.12)',
		backgroundColor: '#FFFFFF',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	googleButtonText: {
		fontSize: 18,
		fontWeight: '600',
		color: themeColors.textPrimary,
	},
	termsText: {
		marginTop: 24,
		fontSize: 14,
		lineHeight: 20,
		color: themeColors.textSecondary,
		textAlign: 'center',
	},
});
