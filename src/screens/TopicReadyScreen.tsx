import React, { useRef, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Animated,
	Easing,
	Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp } from '../navigators/RootNavigator';
import { themeColors } from '../utils/Theme';
import LogoIcon from '../components/LogoIcon';
import PrimaryButton from '../components/PrimaryButton';
import { useAnalysisResult } from '../contexts/AnalysisContext';
import { Topic, TopicDigestResponse } from '../models/Analysis';

const PRIMARY = themeColors.primary ?? '#534AB7';


const TOPICS = [
	'AI Regulation',
	'Gene Editing',
	'Space',
	'Economics',
	'Climate',
];

function TopicPill({ label, index }: { label: string; index: number }) {
	const opacity = useRef(new Animated.Value(0)).current;
	const scale = useRef(new Animated.Value(0.85)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 350,
				delay: 300 + index * 80,
				easing: Easing.out(Easing.quad),
				useNativeDriver: true,
			}),
			Animated.spring(scale, {
				toValue: 1,
				delay: 300 + index * 80,
				useNativeDriver: true,
				damping: 14,
				stiffness: 160,
			}),
		]).start();
	}, []);

	return (
		<Animated.View style={[pillStyles.container, { opacity, transform: [{ scale }] }]}>
			<Text style={pillStyles.label}>{label}</Text>
		</Animated.View>
	);
}

const pillStyles = StyleSheet.create({
	container: {
		borderWidth: 1,
		borderColor: PRIMARY,
		borderRadius: 100,
		paddingHorizontal: 20,
		paddingVertical: 10,
		margin: 5,
		backgroundColor: '#EEEDFE',
	},
	label: {
		fontSize: 15,
		color: PRIMARY,
		fontWeight: '500',
	},
});

// ─── Ready Card ───────────────────────────────────────────────────────────────

function ReadyCard() {
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(16)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 400,
				delay: 700,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration: 400,
				delay: 700,
				easing: Easing.out(Easing.quad),
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	return (
		<Animated.View style={[cardStyles.container, { opacity, transform: [{ translateY }] }]}>
			<View style={cardStyles.iconWrap}>
				<Image source={require('../assets/personalized-icon.png')} style={{ width: 16, height: 16 }} />
			</View>
			<View style={cardStyles.text}>
				<Text style={cardStyles.title}>Your personalized feed{'\n'}is ready</Text>
				<Text style={cardStyles.body}>
					Scrolis will surface what you're missing — without replacing what you already read.
				</Text>
			</View>
		</Animated.View>
	);
}

const cardStyles = StyleSheet.create({
	container: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		padding: 18,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 14,
		marginTop: 28,
	},
	iconWrap: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: `rgba(83,74,183,0.10)`,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		marginTop: 2,
	},
	text: { flex: 1 },
	title: {
		fontSize: 17,
		fontWeight: '700',
		color: '#1A1A2E',
		lineHeight: 24,
		marginBottom: 6,
	},
	body: {
		fontSize: 14,
		lineHeight: 20,
		color: 'rgba(26,26,46,0.55)',
	},
});


export default function TopicsReadyScreen() {
	const navigation = useNavigation<RootStackNavigationProp>();

	// Animate header in
	const headerOpacity = useRef(new Animated.Value(0)).current;
	const headerY = useRef(new Animated.Value(12)).current;
	const { analysis } = useAnalysisResult();
	const [ topics, setTopics ] = React.useState<string[]>([]);

	useEffect(() => {
		if (analysis) {
			// If we already have analysis data, skip animations and show everything immediately
			headerOpacity.setValue(1);
			headerY.setValue(0);
			
				// Extract topics from analysis result
			const extractedTopics = analysis.topics.map((topic: Topic) => topic.category);
			const uniqueTopics = Array.from(new Set(extractedTopics));
			setTopics(uniqueTopics);
		}
	}, [analysis]);

	useEffect(() => {
		Animated.parallel([
			Animated.timing(headerOpacity, {
				toValue: 1,
				duration: 400,
				useNativeDriver: true,
			}),
			Animated.timing(headerY, {
				toValue: 0,
				duration: 400,
				easing: Easing.out(Easing.quad),
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Back */}
				{/* <Pressable
					onPress={() => navigation.replace('SocialMediaSync')}
					hitSlop={12}
					style={styles.backButton}
				>
					<Feather name="chevron-left" size={28} color="#1A1A2E" />
				</Pressable> */}

				{/* Logo */}
				<View style={styles.logoWrap}>
					<LogoIcon />
				</View>

				{/* Header */}
				<Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerY }] }}>
					<Text style={styles.title}>Topics we found for you</Text>
					<Text style={styles.subtitle}>
						Based on your connected account(s), we'll show you diverse perspectives on these topics
					</Text>
				</Animated.View>

				<View style={styles.pillsWrap}>
					{topics.map((topic, index) => (
						<TopicPill key={`topic-${index}`} label={topic} index={index} />
					))}
				</View>
				<ReadyCard />
			</ScrollView>

			{/* Sticky CTA */}
			<View style={styles.footer}>
				<PrimaryButton 
					title="Take me to my digest"
					height={54}
					onPress={() => {
						navigation.navigate('Main');
					}}
				/>

			</View>
		</SafeAreaView>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: themeColors.background },
	content: {
		paddingHorizontal: 24,
		paddingTop: 12,
		paddingBottom: 20,
	},
	backButton: {
		alignSelf: 'flex-start',
		marginBottom: 16,
	},
	logoWrap: {
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: '800',
		color: themeColors.textPrimary,
		textAlign: 'center',
		lineHeight: 40,
		marginBottom: 12,
	},
	subtitle: {
		fontSize: 16,
		lineHeight: 22,
		color: themeColors.textSecondary,
		textAlign: 'center',
		marginBottom: 28,
	},
	pillsWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		marginHorizontal: -5,
	},
	footer: {
		paddingHorizontal: 24,
		paddingTop: 10,
		paddingBottom: 8,
		backgroundColor: themeColors.background,
	},
	// ctaButton: {
	// 	height: 54,
	// 	borderRadius: 18,
	// 	backgroundColor: PRIMARY,
	// 	alignItems: 'center',
	// 	justifyContent: 'center',
	// },
	ctaText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
});