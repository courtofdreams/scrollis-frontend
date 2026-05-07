import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Animated,
	Image,
	StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { themeColors } from '../utils/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp } from '../navigators/RootNavigator';
import PrimaryButton from '../components/PrimaryButton';
import { useAppAuthContext } from '../contexts/AppAuthContext';
import { useTwitterAuth } from '../hooks/useTwitterAuth';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { useRedditAuth } from '../hooks/useRedditAuth';
import { useAuthentication } from '../hooks/useAuthentication';
import FlowPagination from '../components/FlowPagination';

type ConnectionStatus = 'idle' | 'connecting' | 'connected';

type SocialPlatform = {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	status: ConnectionStatus;
};


function RedditIcon() {
	return (
		<View style={iconStyles.redditBg}>
			<Image source={require('../assets/reddit-logo.png')} style={{ width: 35, height: 35 }} />
		</View>
	);
}

function XIcon() {
	return (
		<View style={iconStyles.xBg}>
			<Image source={require('../assets/x-logo.png')} style={{ width: 35, height: 35 }} />
		</View>
	);
}

function TikTokIcon() {
	return (
		<View style={iconStyles.tiktokBg}>
			<Image source={require('../assets/tiktok-logo.png')} style={{ width: 35, height: 35 }} />
		</View>
	);
}

const iconStyles = StyleSheet.create({
	redditBg: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: '#FF4500',
		alignItems: 'center',
		justifyContent: 'center',
	},
	redditText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '800',
	},
	xBg: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: '#000000',
		alignItems: 'center',
		justifyContent: 'center',
	},
	xText: {
		color: '#FFFFFF',
		fontSize: 22,
		fontWeight: '700',
	},
	tiktokBg: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: '#010101',
		alignItems: 'center',
		justifyContent: 'center',
	},
	tiktokText: {
		color: '#FFFFFF',
		fontSize: 24,
	},
});


function ConnectButton({
	status,
	onPress,
}: {
	status: ConnectionStatus;
	onPress: () => void;
}) {
	const pulseAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		if (status === 'connecting') {
			Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, { toValue: 0.6, duration: 700, useNativeDriver: true }),
					Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
				])
			).start();
		} else {
			pulseAnim.stopAnimation();
			Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
		}
	}, [status]);

	if (status === 'connected') {
		return (
			<View style={[btnStyles.base, btnStyles.connectedBase]}>
				<Feather name="check" size={14} color="#1D9E75" style={{ marginRight: 6 }} />
				<Text style={btnStyles.connectedText}>Connected</Text>
			</View>
		);
	}

	if (status === 'connecting') {
		return (
			<Animated.View style={[btnStyles.base, btnStyles.connectingBase, { opacity: pulseAnim }]}>
				<Text style={btnStyles.connectingText}>Connecting...</Text>
			</Animated.View>
		);
	}

	return (
		<Pressable
			style={({ pressed }) => [btnStyles.base, btnStyles.idleBase, pressed && btnStyles.idlePressed]}
			onPress={onPress}
		>
			<Text style={btnStyles.idleText}>Connect</Text>
		</Pressable>
	);
}

const btnStyles = StyleSheet.create({
	base: {
		height: 40,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
	},
	idleBase: {
		backgroundColor: themeColors.primary,
	},
	idlePressed: {
		opacity: 0.85,
	},
	idleText: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: '700',
	},
	connectingBase: {
		borderWidth: 1.5,
		borderColor: themeColors.primary,
		backgroundColor: 'transparent',
	},
	connectingText: {
		color: themeColors.primary,
		fontSize: 15,
		fontWeight: '600',
	},
	connectedBase: {
		borderWidth: 1.5,
		borderColor: '#1D9E75',
		backgroundColor: 'transparent',
	},
	connectedText: {
		color: '#1D9E75',
		fontSize: 15,
		fontWeight: '600',
	},
});


function PlatformCard({
	platform,
	onConnect,
}: {
	platform: SocialPlatform;
	onConnect: (id: string) => void;
}) {
	return (
		<View style={cardStyles.container}>
			<View style={cardStyles.header}>
				{platform.icon}
				<View style={cardStyles.info}>
					<Text style={cardStyles.name}>{platform.name}</Text>
					<Text style={cardStyles.description}>{platform.description}</Text>
				</View>
			</View>
			<ConnectButton
				status={platform.status}
				onPress={() => onConnect(platform.id)}
			/>
		</View>
	);
}

const cardStyles = StyleSheet.create({
	container: {
		backgroundColor: themeColors.cardBackground,
		borderRadius: 16,
		padding: 18,
		marginBottom: 20,
		gap: 14,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
	},
	info: {
		flex: 1,
	},
	name: {
		fontSize: 18,
		fontWeight: '600',
		color: themeColors.textPrimary,
		marginBottom: 2,
	},
	description: {
		fontSize: 13,
		color: themeColors.textPrimary,
		lineHeight: 18,
	},
});

const INITIAL_PLATFORMS: SocialPlatform[] = [
	{
		id: 'reddit',
		name: 'Reddit',
		description: 'Subreddits and posts you follow',
		icon: <RedditIcon />,
		status: 'idle',
	},
	{
		id: 'x',
		name: 'X',
		description: 'Accounts and topics in your feed',
		icon: <XIcon />,
		status: 'idle',
	},
	{
		id: 'tiktok',
		name: 'TikTok',
		description: 'Creators and topics you engage with',
		icon: <TikTokIcon />,
		status: 'idle',
	},
];

export default function SocialMediaSyncScreen() {
	const navigation = useNavigation<RootStackNavigationProp>();
	const [platforms, setPlatforms] = useState<SocialPlatform[]>(INITIAL_PLATFORMS);
	const { isTwitterAuthenticated, isRedditAuthenticated, setNeedToConnectedSocial } = useAppAuthContext();
	const { signIn: twitterSignIn, loading } = useTwitterAuth()
	const [errorMessage, setErrorMessage] = useState('');
	const scrollRef = useRef<ScrollView>(null);
	const { signIn: signInReddit, loading: redditLoading, getMe, expiresIn, refreshToken } = useRedditAuth()
	const { updateNeedToSyncSocialMedia } = useAuthentication();
    const { redditAccessToken } = useAppAuthContext()  
	const anyConnected = useMemo(() => platforms.some((p) => p.status === 'connected'), [platforms]);


	function connectToTwitter(id: string) {
		setPlatforms((prev) =>
			prev.map((p) => (p.id === 'x' ? { ...p, status: 'connecting' } : p))
		);

		twitterSignIn().then(() => {
			setPlatforms((prev) =>
				prev.map((p) => (p.id === 'x' ? { ...p, status: 'connected' } : p))
			);
		}).catch(() => {
			setErrorMessage('Failed to connect to X. Please try again.');
			setPlatforms((prev) =>
				prev.map((p) => (p.id === 'x' ? { ...p, status: 'idle' } : p))
			);
		});
	}

	function connectToReddit(id: string) {
		setPlatforms((prev) =>
			prev.map((p) => (p.id === 'reddit' ? { ...p, status: 'connecting' } : p))
		);

		signInReddit().then(() => {
			console.log('Reddit sign-in successful');
		}).catch((error) => {
			if (error.message !== 'cancel') {
				setErrorMessage(error.message || 'Failed to connect to Reddit. Please try again.');
			}
			
			setPlatforms((prev) =>
				prev.map((p) => (p.id === 'reddit' ? { ...p, status: 'idle' } : p))
			);
		});
	}

	function handleConnect(id: string) {
		console.log('Connect button pressed for:', id);
		switch (id) {
			case 'x':
				connectToTwitter(id);
				break;
			case 'reddit':
				connectToReddit(id);
				break;
			case 'tiktok':
				// connectToTikTok(id);
				break;
			default:
				break;
		}
	}

	function handleBuildDigest() {
		if (!anyConnected) return;
		try {
			updateNeedToSyncSocialMedia(false);
		} catch (error) {
			console.error("Failed to update needToSyncSocialMedia:", error);
		}finally {
			navigation.navigate('BuildingDigest');
		}	
		
	}

	useEffect(() => {
		if (errorMessage) {
			scrollRef.current?.scrollTo({ y: 0, animated: true });
		}
	}, [errorMessage]);

	useEffect(() => {
		setPlatforms((prev) =>
			prev.map((p) => {
				if (p.id === 'x') {
					return { ...p, status: isTwitterAuthenticated ? 'connected' : 'idle' };
				}
				if (p.id === 'reddit') {
					return { ...p, status: isRedditAuthenticated ? 'connected' : 'idle' };
				}
				return p;
			})
		);
	}, [isTwitterAuthenticated, isRedditAuthenticated]);

	useEffect(() => {
		if ((redditAccessToken && redditAccessToken !== '') && isRedditAuthenticated && expiresIn !== null && refreshToken) {
			getMe(redditAccessToken).then(() => {
				setPlatforms((prev) => prev.map((p) => (p.id === 'reddit' ? { ...p, status: 'connected' } : p)));
			}).catch((err) => {
				console.error('Failed to fetch Reddit user info after authentication:', err);
			});
		}
	}, [redditAccessToken, isRedditAuthenticated, expiresIn, refreshToken]);

	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
			<StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
			<ApiErrorBanner message={errorMessage} onDismiss={() => setErrorMessage('')} />
			<ScrollView
				ref={scrollRef}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.topSection}>
					<View style={styles.rightSpacer} />
					<FlowPagination currentIndex={4} total={5} />
					<View style={styles.rightSpacer} />
				</View>

				<Text style={styles.title}>Connect your feeds</Text>
				<Text style={styles.subtitle}>
					We'll read your timeline so you don't have to tell us anything about yourself.
				</Text>

				<View style={styles.cards}>
					{platforms.map((platform) => (
						<PlatformCard
							key={platform.id}
							platform={platform}
							onConnect={handleConnect}
						/>
					))}
				</View>

				<Text style={styles.privacyNote}>We only read. We never post.</Text>
			</ScrollView>

			<View style={styles.footer}>
				<PrimaryButton
					title="Build my digest"
					onPress={handleBuildDigest}
					isDisabled={!anyConnected}
					height={52}
				/>
			</View>
		</SafeAreaView>
	);
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: themeColors.background,
	},
	content: {
		paddingHorizontal: 28, 
		paddingTop: 12,
		paddingBottom: 12,
	},
	topSection: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 4,
		marginBottom: 8,
	},
	rightSpacer: {
		width: 40,
	},
	backButton: {
		alignSelf: 'flex-start',
		marginBottom: 12,
	},
	title: {
		fontSize: 25,
		fontWeight: '700',
		color: themeColors.textPrimary,
		lineHeight: 38,
	},
	subtitle: {
		fontSize: 16,
		lineHeight: 22,
		color: 'rgba(26,26,46,0.55)',
		marginBottom: 24,
	},
	cards: {
		gap: 0,
	},
	privacyNote: {
		textAlign: 'center',
		fontSize: 12,
		color: 'rgba(26,26,46,0.4)',
		marginBottom: 8,
	},
	footer: {
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 8,
	},
});