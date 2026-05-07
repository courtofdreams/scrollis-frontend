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
	StatusBar,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { themeColors } from '../utils/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp } from '../navigators/RootNavigator';
import { ApiError, useAuthentication } from '../hooks/useAuthentication';
import { useAppAuthContext } from '../contexts/AppAuthContext';
import ApiErrorBanner from '../components/ApiErrorBanner';
import FlowPagination from '../components/FlowPagination';

// ─── Validation helpers ───────────────────────────────────────────────────────

type PasswordRules = {
	minLength: boolean;
	uppercase: boolean;
	lowercase: boolean;
	number: boolean;
	special: boolean;
};

function validatePassword(password: string): PasswordRules {
	return {
		minLength: password.length >= 8,
		uppercase: /[A-Z]/.test(password),
		lowercase: /[a-z]/.test(password),
		number: /[0-9]/.test(password),
		special: /[^A-Za-z0-9]/.test(password),
	};
}

function validateFullName(name: string): string {
	if (!name.trim()) return 'Full name is required.';
	if (name.trim().length < 2) return 'Name must be at least 2 characters.';
	if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
	return '';
}

function validateUsername(username: string): string {
	if (!username.trim()) return 'Username is required.';
	if (username.length < 3) return 'Username must be at least 3 characters.';
	if (username.length > 20) return 'Username must be 20 characters or fewer.';
	if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores.';
	return '';
}

function validateEmail(email: string): string {
	if (!email.trim()) return 'Email address is required.';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
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

// ─── AnimatedBorder ───────────────────────────────────────────────────────────

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


export default function CreateAccountScreen() {
	const navigation = useNavigation<RootStackNavigationProp>();

	const [fullName, setFullName] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [apiError, setApiError] = useState('');

	const [focusedField, setFocusedField] = useState<string | null>(null);

	const [touched, setTouched] = useState({
		fullName: false,
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
	const fullNameRef = useRef<TextInput>(null);
	const usernameRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const passwordRef = useRef<TextInput>(null);

	const passwordRules = validatePassword(password);
	const allPasswordRulesPassed = Object.values(passwordRules).every(Boolean);

	const isFormValid =
		fullName.trim() !== '' &&
		username.trim() !== '' &&
		email.trim() !== '' &&
		allPasswordRulesPassed &&
		!errors.fullName &&
		!errors.username &&
		!errors.email;


	const { signUp } = useAuthentication();


	function markTouched(field: keyof typeof touched) {
		setTouched((prev) => ({ ...prev, [field]: true }));
	}

	function handleFullNameBlur() {
		setFocusedField(null);
		markTouched('fullName');
		setErrors((prev) => ({ ...prev, fullName: validateFullName(fullName) }));
	}

	function handleUsernameBlur() {
		setFocusedField(null);
		markTouched('username');
		setErrors((prev) => ({ ...prev, username: validateUsername(username) }));
	}

	function handleEmailBlur() {
		setFocusedField(null);
		markTouched('email');
		setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
	}

	function handlePasswordBlur() {
		setFocusedField(null);
		markTouched('password');
		if (password.length > 0 && !allPasswordRulesPassed) {
			setErrors((prev) => ({ ...prev, password: 'Password does not meet all requirements.' }));
		} else {
			setErrors((prev) => ({ ...prev, password: '' }));
		}
	}

	async function handleContinue() {
		if (!isFormValid || isLoading) return;

		setApiError('');
		setIsLoading(true);

		try {
			await signUp({ full_name: fullName, username, email, password });
			navigation.navigate('SocialMediaSync');

		} catch (err) {
			const error = err as ApiError;
			if (error.fields && error.fields.length > 0) {
				error.fields.forEach(({ field, message }) => {
					setErrors((prev) => ({ ...prev, [field]: message }));
					setTouched((prev) => ({ ...prev, [field]: true }));
				});
			} else {
				setApiError(error.message || 'Something went wrong. Please try again.');
			}


		} finally {
			setIsLoading(false);
		}
	}

	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
			<ApiErrorBanner message={apiError} onDismiss={() => setApiError('')} />
			<KeyboardAvoidingView style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
				<ScrollView
					ref={scrollRef}
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					automaticallyAdjustKeyboardInsets={true}
				>
					<View style={styles.topSection}>
						<Pressable
							onPress={() => {
								navigation.setParams({ currentIndex: 2 });
								navigation.goBack();
							}}
							hitSlop={12}
							style={styles.backButton}
						>
							<Feather name="chevron-left" size={28} color={themeColors.textPrimary} />
						</Pressable>
						<FlowPagination currentIndex={3} total={5} />
						<View style={styles.rightSpacer} />
					</View>

					<Text style={styles.title}>Create your account</Text>
					<Text style={styles.subtitle}>Takes less than a minute.</Text>
					<View style={styles.formGroup}>
						<Text style={styles.label}>Full name</Text>
						<AnimatedBorder
							focused={focusedField === 'fullName'}
							hasError={touched.fullName && !!errors.fullName}
						>
							<TextInput
								ref={fullNameRef}
								value={fullName}
								onChangeText={(t) => {
									setFullName(t);
									if (touched.fullName) setErrors((prev) => ({ ...prev, fullName: validateFullName(t) }));
								}}
								placeholder="Jane Doe"
								placeholderTextColor={themeColors.textSecondary}
								style={styles.textInput}
								onFocus={() => setFocusedField('fullName')}
								onBlur={handleFullNameBlur}
								returnKeyType="next"
								onSubmitEditing={() => usernameRef.current?.focus()}
							/>
						</AnimatedBorder>
						{touched.fullName && <ErrorMessage message={errors.fullName} />}
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Username</Text>
						<AnimatedBorder
							focused={focusedField === 'username'}
							hasError={touched.username && !!errors.username}
						>
							<TextInput
								ref={usernameRef}
								value={username}
								onChangeText={(t) => {
									setUsername(t);
									if (touched.username) setErrors((prev) => ({ ...prev, username: validateUsername(t) }));
								}}
								placeholder="janedoe"
								placeholderTextColor={themeColors.textSecondary}
								style={styles.textInput}
								autoCapitalize="none"
								onFocus={() => setFocusedField('username')}
								onBlur={handleUsernameBlur}
								returnKeyType="next"
								onSubmitEditing={() => emailRef.current?.focus()}
							/>
						</AnimatedBorder>
						{touched.username && <ErrorMessage message={errors.username} />}
						{!errors.username && !touched.username && (
							<Text style={styles.hintText}>Letters, numbers, and underscores only. 3–20 characters.</Text>
						)}
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Email address</Text>
						<AnimatedBorder
							focused={focusedField === 'email'}
							hasError={touched.email && !!errors.email}
						>
							<TextInput
								ref={emailRef}
								value={email}
								onChangeText={(t) => {
									setEmail(t);
									if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(t) }));
								}}
								placeholder="jane@example.com"
								placeholderTextColor={themeColors.textSecondary}
								style={styles.textInput}
								keyboardType="email-address"
								autoCapitalize="none"
								onFocus={() => setFocusedField('email')}
								onBlur={handleEmailBlur}
								returnKeyType="next"
								onSubmitEditing={() => passwordRef.current?.focus()}
							/>
						</AnimatedBorder>
						{touched.email && <ErrorMessage message={errors.email} />}
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Password</Text>
						<AnimatedBorder
							focused={focusedField === 'password'}
							hasError={touched.password && !!errors.password}
						>
							<TextInput
								ref={passwordRef}
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
								returnKeyType="done"
								onSubmitEditing={handleContinue}
							/>
							<Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eyeButton}>
								<Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color={themeColors.textSecondary} />
							</Pressable>
						</AnimatedBorder>

						{touched.password && <ErrorMessage message={errors.password} />}

						{touched.password && (
							<View style={styles.validationList}>
								<ValidationItem label="At least 8 characters" passed={passwordRules.minLength} />
								<ValidationItem label="One uppercase letter" passed={passwordRules.uppercase} />
								<ValidationItem label="One lowercase letter" passed={passwordRules.lowercase} />
								<ValidationItem label="One number" passed={passwordRules.number} />
								<ValidationItem label="One special character" passed={passwordRules.special} />
							</View>
						)}
					</View>

					<Pressable
						style={[styles.primaryButton, (!isFormValid || isLoading) && styles.primaryButtonDisabled]}
						onPress={handleContinue}
						disabled={!isFormValid || isLoading}
					>
						{isLoading ? (
							<View style={styles.loadingRow}>
								<ActivityIndicator color="#FFFFFF" size="small" />
								<Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Creating account…</Text>
							</View>
						) : (
							<Text style={styles.primaryButtonText}>Continue</Text>
						)}
					</Pressable>


					{/* <View style={styles.dividerRow}>
					<View style={styles.dividerLine} />
					<Text style={styles.dividerText}>or</Text>
					<View style={styles.dividerLine} />
				</View>
 
				<Pressable style={styles.googleButton}>
					<Image source={require('../assets/google-logo.png')} style={{ width: 22, height: 22 }} />
					<Text style={styles.googleButtonText}>Sign up with Google</Text>
				</Pressable> */}

					<Text style={styles.termsText}>
						By continuing, you agree to our Terms and Privacy Policy.
					</Text>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}


const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: themeColors.background },
	content: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 28 },
	topSection: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 4,
		marginBottom: 5,
		// paddingBottom: 80 
	},
	backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
	rightSpacer: { width: 40 },
	title: { fontSize: 25, fontWeight: '700', color: themeColors.textPrimary, lineHeight: 40 },
	subtitle: { marginBottom: 22, fontSize: 16, lineHeight: 26, color: themeColors.textPrimary },
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