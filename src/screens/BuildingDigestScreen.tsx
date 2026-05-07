import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigators/RootNavigator';
import { themeColors } from '../utils/Theme';
import LogoIcon from '../components/LogoIcon';
import { useAnalysis } from '../hooks/useAnalysis';
import { useAnalysisResult } from '../contexts/AnalysisContext';

const PRIMARY = themeColors.primary ?? '#534AB7';

// ─── Steps config ─────────────────────────────────────────────────────────────

const STEPS = [
	{ label: 'Reading your Reddit feed...', duration: 6000 },
	{ label: 'Identifying topics you follow...', duration: 6000 },
	{ label: 'Detecting perspective gaps...', duration: 6000 },
	{ label: 'Building your digest...', duration: 7000 },
];

const TOTAL_DURATION = STEPS.reduce((sum, s) => sum + s.duration, 0);



function ProgressBar({ progress }: { progress: Animated.Value }) {
	const width = progress.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '100%'],
	});
	return (
		<View style={progressStyles.track}>
			<Animated.View style={[progressStyles.fill, { width }]} />
		</View>
	);
}

const progressStyles = StyleSheet.create({
	track: {
		height: 4, borderRadius: 2,
		backgroundColor: 'rgba(83,74,183,0.15)', overflow: 'hidden',
	},
	fill: { height: 4, borderRadius: 2, backgroundColor: PRIMARY },
});

// ─── Lyrics Line ──────────────────────────────────────────────────────────────
// Each line has 3 states:
//   'upcoming' — not yet shown
//   'active'   — current step, bold + bright
//   'past'     — already done, muted + shifted up

type LineState = 'active' | 'past';

function LyricsLine({ label, state, position }: {
	label: string;
	state: LineState;
	// position = index from active (0 = active, -1 = one above, -2 = two above)
	position: number;
}) {
	const translateY = useRef(new Animated.Value(20)).current;
	const opacity = useRef(new Animated.Value(0)).current;
	const scale = useRef(new Animated.Value(0.95)).current;

	// Animate in on mount
	useEffect(() => {
		Animated.parallel([
			Animated.timing(translateY, {
				toValue: 0,
				duration: 380,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: state === 'active' ? 1 : opacityForPosition(position),
				duration: 380,
				useNativeDriver: true,
			}),
			Animated.timing(scale, {
				toValue: 1,
				duration: 380,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	useEffect(() => {
		Animated.parallel([
			Animated.timing(translateY, {
				toValue: positionToTranslateY(position),
				duration: 400,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: state === 'active' ? 1 : opacityForPosition(position),
				duration: 350,
				useNativeDriver: true,
			}),
			Animated.timing(scale, {
				toValue: state === 'active' ? 1 : 0.92,
				duration: 350,
				useNativeDriver: true,
			}),
		]).start();
	}, [state, position]);

	return (
		<Animated.Text
			style={[
				lyricsStyles.line,
				state === 'active' && lyricsStyles.activeLine,
				{ opacity, transform: [{ translateY }, { scale }] },
			]}
		>
			{label}
		</Animated.Text>
	);
}

// Past lines fade more as they go further up (position -1, -2, -3...)
function opacityForPosition(position: number): number {
	if (position === -1) return 0.38;
	if (position === -2) return 0.18;
	return 0.08;
}

// Slight upward nudge per past position for stacking feel
function positionToTranslateY(position: number): number {
	if (position === 0) return 0;
	return 0; // translateY is handled by the stack layout, not per-line
}

const lyricsStyles = StyleSheet.create({
	line: {
		fontSize: 16,
		lineHeight: 28,
		color: '#1A1A2E',
		textAlign: 'center',
		fontWeight: '400',
		marginVertical: 2,
	},
	activeLine: {
		fontSize: 18,
		fontWeight: '400',
		lineHeight: 30,
	},
});


type StepEntry = { label: string; addedAt: number };

function LyricsStack({ steps, currentIndex }: {
	steps: StepEntry[];
	currentIndex: number;
}) {
	// Show max last 2 steps
	const visible = steps.slice(-3);

	return (
		<View style={stackStyles.container}>
			{visible.map((step, i) => {
				const isActive = i === visible.length - 1;
				// position: 0 = active, -1 = one above, etc.
				const position = i - (visible.length - 1);
				return (
					<LyricsLine
						key={step.addedAt}
						label={step.label}
						state={isActive ? 'active' : 'past'}
						position={position}
					/>
				);
			})}
		</View>
	);
}

const stackStyles = StyleSheet.create({
	container: {
		alignItems: 'center',
		minHeight: 110,
		justifyContent: 'flex-end',
	},
});


export default function BuildingDigestScreen() {
	const navigation = useNavigation<RootStackNavigationProp>();
	const [visibleSteps, setVisibleSteps] = useState<StepEntry[]>([
		{ label: STEPS[0].label, addedAt: Date.now() },
	]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const progressAnim = useRef(new Animated.Value(0)).current;

	const { setAnalysis } = useAnalysisResult();
	const { fetchAnalysis } = useAnalysis();

	useEffect(() => {
		let isMounted = true;
		const timers: ReturnType<typeof setTimeout>[] = [];

		// Progress slowly goes to 85% while waiting
		Animated.timing(progressAnim, {
			toValue: 0.85,
			duration: 30000,
			easing: Easing.out(Easing.quad),
			useNativeDriver: false,
		}).start();

		let elapsed = 0;

		STEPS.forEach((step, index) => {
			if (index === 0) return;

			elapsed += STEPS[index - 1].duration;

			const t = setTimeout(() => {
				if (!isMounted) return;

				setCurrentIndex(index);
				setVisibleSteps(prev => [
					...prev,
					{ label: step.label, addedAt: Date.now() },
				]);
			}, elapsed);

			timers.push(t);
		});

		const loadDigest = async () => {
			try {
				const _result = await fetchAnalysis();

				if (!isMounted) return;

				// Finish progress to 100%
				Animated.timing(progressAnim, {
					toValue: 1,
					duration: 600,
					easing: Easing.out(Easing.quad),
					useNativeDriver: false,
				}).start(() => {
					if (isMounted) {
						navigation.navigate('TopicReady');
					}
				});
			} catch (e) {
				if (!isMounted) return;

				console.error(e);
				navigation.navigate('Error');
			}
		};

		loadDigest();

		return () => {
			isMounted = false;
			timers.forEach(clearTimeout);
		};
	}, []);

	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
			<View style={styles.inner}>
				<LogoIcon />
				<View style={styles.progressWrap}>
					<ProgressBar progress={progressAnim} />
				</View>
				<LyricsStack steps={visibleSteps} currentIndex={currentIndex} />

				<Text style={styles.hint}>This usually takes 20–30 seconds.</Text>
			</View>
		</SafeAreaView>
	);
}


const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: themeColors.background, justifyContent: 'center' },
	inner: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 36,
		gap: 0,
	},
	progressWrap: {
		width: '100%',
		marginTop: 32,
		marginBottom: 20,
	},
	hint: {
		position: 'absolute',
		bottom: 80,
		fontSize: 13,
		color: themeColors.textDisabled,
		textAlign: 'center',
	},
});