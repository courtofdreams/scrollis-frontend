import React, { useState, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Pressable,
	ScrollView,
	Image,
	Animated,
	ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { themeColors } from '../utils/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp } from '../navigators/RootNavigator';
import { ApiError, useAuthentication } from '../hooks/useAuthentication';
import { useAppAuthContext } from '../contexts/AppAuthContext';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { LoginData } from '../models/Account';
 
 
function validateUsername(username: string): string {
  if (!username.trim()) return 'Username is required.';
  if (username.trim().includes('@') && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username))) {
    return 'Please enter a valid email address.';
  }

  return '';
}

 
function ValidationItem({ label, passed }: { label: string; passed: boolean }) {
	return (
		<View style={valStyles.row}>
			<View style={[valStyles.circle, passed && valStyles.circlePassed]}>
				{passed && <Feather name="check" size={11} color="#FFFFFF" />}
			</View>
			<Text style={[valStyles.label, passed && valStyles.labelPassed]}>{label}</Text>
		</View>
	);
}
 
const valStyles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
	circle: {
		width: 19,
		height: 19,
		borderRadius: 10,
		borderWidth: 1.5,
		borderColor: 'rgba(26,26,46,0.22)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 9,
	},
	circlePassed: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
	label: { fontSize: 14, color: 'rgba(26,26,46,0.4)' },
	labelPassed: { color: '#1D9E75', fontWeight: '500' },
});
 

function AnimatedBorder({
	children,
	focused,
	hasError,
}: {
	children: React.ReactNode;
	focused: boolean;
	hasError?: boolean;
}) {
	const anim = useRef(new Animated.Value(0)).current;
 
	React.useEffect(() => {
		Animated.timing(anim, {
			toValue: focused ? 1 : 0,
			duration: 200,
			useNativeDriver: false,
		}).start();
	}, [focused]);
 
	const borderColor = hasError
		? '#E24B4A'
		: anim.interpolate({
				inputRange: [0, 1],
				outputRange: ['rgba(26,26,46,0.12)', themeColors.primary],
		  });
 
	const borderWidth = hasError
		? 1.5
		: anim.interpolate({
				inputRange: [0, 1],
				outputRange: [1, 1.5],
		  });
 
	return (
		<Animated.View style={[styles.inputWrapper, { borderColor, borderWidth }]}>
			{children}
		</Animated.View>
	);
}
 
 
function ErrorMessage({ message }: { message: string }) {
	if (!message) return null;
	return (
		<View style={styles.errorRow}>
			<Feather name="alert-circle" size={13} color="#E24B4A" style={{ marginRight: 5, marginTop: 1 }} />
			<Text style={styles.errorText}>{message}</Text>
		</View>
	);
}
 
export default function LoginScreen() {
	const navigation = useNavigation<RootStackNavigationProp>();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [apiError, setApiError] = useState('');
	const [focusedField, setFocusedField] = useState<string | null>(null);
	const { needToConnectedSocial } = useAppAuthContext();
 
	const [touched, setTouched] = useState({
		username: false,
		email: false,
		password: false,
	});
 
	const [errors, setErrors] = useState({
		fullName: '',
		username: '',
		email: '',
		password: '',
	});
 
	const scrollRef = useRef<ScrollView>(null);
  
	const isFormValid =
		username.trim() !== '' &&
		password.trim() !== '' &&
		!errors.username &&
		!errors.password;

	
	const { signIn } = useAuthentication();

 
	function markTouched(field: keyof typeof touched) {
		setTouched((prev) => ({ ...prev, [field]: true }));
	}
 
	function handleUsernameBlur() {
		setFocusedField(null);
		markTouched('username');
		setErrors((prev) => ({ ...prev, username: validateUsername(username) }));
	}
 
	function handlePasswordBlur() {
		setFocusedField(null);
		markTouched('password');
		if (password.length <= 0) {
			setErrors((prev) => ({ ...prev, password: 'Password is required.' }));
		} else {
			setErrors((prev) => ({ ...prev, password: '' }));
		}
	}
 
	async function handleLogin() {
		if (!isFormValid || isLoading) return;

		setApiError('');
		setIsLoading(true);

		try {
			const identifier = username.includes('@') ? 'email' : 'username';
			const loginData: LoginData = { identifier, password };
			if (identifier === 'email') {
				loginData.email = username;
			}else {
				loginData.username = username;
			}
			await signIn(loginData);
			if (needToConnectedSocial){
				navigation.navigate('SocialMediaSync');
			}else {	
				navigation.navigate('FeedSkeletonScreen');
			}

		} catch (err) {
			const error = err as ApiError;
			if (error.fields && error.fields.length > 0) {
				error.fields.forEach(({ field, message }) => {
					setErrors((prev) => ({ ...prev, [field]: message }));
					setTouched((prev) => ({ ...prev, [field]: true }));
				});
			}else {
				setApiError(error.message || 'Something went wrong. Please try again.');
			}


		} finally {
			setIsLoading(false);
		}
	}
 
	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
			<ApiErrorBanner message={apiError} onDismiss={() => setApiError('')} />
			<ScrollView
				ref={scrollRef}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<Pressable
					onPress={() => {
						if (navigation.canGoBack()) { navigation.goBack(); return; }
						navigation.navigate('Starting');
					}}
					hitSlop={12}
					style={styles.backButton}
				>
					<Feather name="chevron-left" size={28} color={themeColors.textPrimary} />
				</Pressable>
 
				<Text style={styles.title}>Welcome back</Text>
				<Text style={styles.subtitle}>Sign in to your account.</Text>
				<View style={styles.formGroup}>
					<Text style={styles.label}>Email (or username)</Text>
					<AnimatedBorder
						focused={focusedField === 'username'}
						hasError={touched.username && !!errors.username}
					>
						<TextInput
							value={username}
							onChangeText={(t) => {
								setUsername(t);
								if (touched.username) setErrors((prev) => ({ ...prev, username: validateUsername(t) }));
							}}
							placeholder="jane@example.com"
							placeholderTextColor={themeColors.textSecondary}
							style={styles.textInput}
							autoCapitalize="none"
							onFocus={() => setFocusedField('username')}
							onBlur={handleUsernameBlur}
						/>
					</AnimatedBorder>
					{touched.username && <ErrorMessage message={errors.username} />}
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.label}>Password</Text>
					<AnimatedBorder
						focused={focusedField === 'password'}
						hasError={touched.password && !!errors.password}
					>
						<TextInput
							value={password}
							onChangeText={(t) => {
								setPassword(t);
								markTouched('password');
								if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
							}}
							placeholder="••••••••"
							placeholderTextColor={themeColors.textSecondary}
							style={[styles.textInput, { flex: 1 }]}
							secureTextEntry={!showPassword}
							autoCapitalize="none"
							onFocus={() => setFocusedField('password')}
							onBlur={handlePasswordBlur}
						/>
						<Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eyeButton}>
							<Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color={themeColors.textSecondary} />
						</Pressable>
					</AnimatedBorder>
 
					{touched.password && <ErrorMessage message={errors.password} />}
				</View>
 
				<Pressable
					style={[styles.primaryButton, (!isFormValid || isLoading) && styles.primaryButtonDisabled]}
					onPress={handleLogin}
					disabled={!isFormValid || isLoading}
				>
					{isLoading ? (
						<View style={styles.loadingRow}>
							<ActivityIndicator color="#FFFFFF" size="small" />
							<Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Signing in…</Text>
						</View>
					) : (
						<Text style={styles.primaryButtonText}>Sign in</Text>
					)}
				</Pressable>
				
				<Text style={styles.termsText}>
				</Text>
			</ScrollView>
		</SafeAreaView>
	);
}


const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: themeColors.background },
	content: { paddingHorizontal: 32, paddingTop: 18, paddingBottom: 28 },
	backButton: { alignSelf: 'flex-start', marginBottom: 5 },
	title: { fontSize: 25, fontWeight: '700', color: themeColors.textPrimary, lineHeight: 40 },
	subtitle: {  marginBottom: 22, fontSize: 16, lineHeight: 26, color: themeColors.textPrimary },
	formGroup: { marginBottom: 18 },
	label: { marginBottom: 10, fontSize: 14, fontWeight: '400', color: themeColors.textPrimary },

	inputWrapper: {
		height: 52,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 18,
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		color: themeColors.textPrimary,
		height: '100%',
	},
	eyeButton: { paddingLeft: 8 },

	errorRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 7, paddingHorizontal: 2 },
	errorText: { fontSize: 13, color: '#E24B4A', lineHeight: 18, flex: 1 },

	hintText: { fontSize: 12, color: 'rgba(26,26,46,0.4)', marginTop: 6, paddingHorizontal: 2 },

	validationList: { marginTop: 12, paddingLeft: 2 },

	primaryButton: {
		marginTop: 6,
		height: 52,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: themeColors.primary,
	},
	primaryButtonDisabled: { opacity: 0.4 },
	primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
	loadingRow: { flexDirection: 'row', alignItems: 'center' },

	dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 22 },
	dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(26,26,46,0.10)' },
	dividerText: { marginHorizontal: 12, fontSize: 18, color: themeColors.textSecondary },

	googleButton: {
		height: 52,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(26,26,46,0.12)',
		backgroundColor: '#FFFFFF',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	googleButtonText: { fontSize: 18, fontWeight: '600', color: themeColors.textPrimary },
	termsText: { marginTop: 24, fontSize: 12, lineHeight: 20, color: themeColors.textSecondary, textAlign: 'center' },
});