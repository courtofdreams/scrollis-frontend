import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigators/RootNavigator';
import { themeColors } from '../utils/Theme';
import LogoIcon from '../components/LogoIcon';
import { useAnalysis } from '../hooks/useAnalysis';
import { useAnalysisResult } from '../contexts/AnalysisContext';

const PRIMARY = themeColors.primary ?? '#534AB7';

const STEPS = [
  { label: 'Reading your Reddit feed...', duration: 6000 },
  { label: 'Identifying topics you follow...', duration: 6000 },
  { label: 'Detecting perspective gaps...', duration: 6000 },
  { label: 'Building your digest...', duration: 7000 },
];

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

type LineState = 'active' | 'past';

function LyricsLine({ label, state, position }: {
  label: string;
  state: LineState;
  position: number;
}) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

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

function opacityForPosition(position: number): number {
  if (position === -1) return 0.38;
  if (position === -2) return 0.18;
  return 0.08;
}

function positionToTranslateY(position: number): number {
  if (position === 0) return 0;
  return 0;
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
  const visible = steps.slice(-3);

  return (
    <View style={stackStyles.container}>
      {visible.map((step, i) => {
        const isActive = i === visible.length - 1;
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

export default function FeedSkeletonScreen() {
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
        const result = await fetchAnalysis();

        if (!isMounted) return;

        setAnalysis(result);

        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start(() => {
          if (isMounted) {
            navigation.navigate('Main');
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
    <SafeAreaView style={styles.container}>
      <View style={feedStyles.screen}>
        <View style={feedStyles.topBar}>
          <View style={feedStyles.brandRow}>
            <Image
              source={require('../assets/logo.png')}
              style={feedStyles.logoImage}
              resizeMode="contain"
            />
            <Text style={feedStyles.logo}>Scrolis</Text>
          </View>
        </View>

        <View style={feedStyles.scrollContent}>
          <View style={feedStyles.digestBannerSkeleton}>
            <View style={feedStyles.dismissSkeleton} />
            <View style={feedStyles.bannerLineShort} />
            <View style={feedStyles.bannerLineLong} />
            <View style={feedStyles.addAccountSkeleton} />
          </View>

          <View style={feedStyles.digestCardSkeleton}>
            <View style={feedStyles.digestTitleSkeleton} />
            <View style={feedStyles.digestSubtitleSkeleton} />
            <View style={feedStyles.digestTextSkeleton} />
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={feedStyles.digestPointSkeleton} />
            ))}
          </View>

          <View style={feedStyles.sectionTitleSkeleton} />

          {[0, 1, 2].map(i => (
            <View key={i} style={feedStyles.topicCardSkeleton}>
              <View style={feedStyles.topicTitleSkeleton} />
              <View style={feedStyles.topicDescSkeleton} />
              <View style={feedStyles.topicMetaSkeleton} />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: themeColors.textWhite,
  },
  screen: {
    flex: 1,
    backgroundColor: '#E8E6E0',
  },
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

const feedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8E6E0',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 16,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoImage: {
    width: 26,
    height: 26,
    marginRight: 2,
  },
  logo: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#2F2A6B',
    display: 'flex',
    alignItems: 'center',
  },
  logoSkeleton: { width: 26, height: 26, backgroundColor: '#DDD', borderRadius: 6, marginRight: 8 },
  titleSkeleton: { width: 120, height: 18, backgroundColor: '#DDD', borderRadius: 6 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 140,
  },

  digestBannerSkeleton: {
    backgroundColor: '#DCDCED',
    borderColor: '#BFC0EB',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  dismissSkeleton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C8C9E8',
  },
  bannerLineShort: { width: '52%', height: 12, backgroundColor: '#E7E7F1', borderRadius: 6, marginBottom: 8 },
  bannerLineLong: { width: '80%', height: 12, backgroundColor: '#E7E7F1', borderRadius: 6, marginBottom: 12 },
  addAccountSkeleton: { width: 92, height: 12, backgroundColor: '#CFCFF2', borderRadius: 6 },

  digestCardSkeleton: { backgroundColor: '#F7F7F8', borderRadius: 20, borderColor: '#E5E7EB', borderWidth: 1, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 20 },
  digestTitleSkeleton: { width: '60%', height: 22, backgroundColor: '#E0E0E0', borderRadius: 8, marginBottom: 8 },
  digestSubtitleSkeleton: { width: '40%', height: 16, backgroundColor: '#E6E0FF', borderRadius: 8, marginBottom: 12 },
  digestTextSkeleton: { width: '100%', height: 48, backgroundColor: '#EEE', borderRadius: 8, marginBottom: 12 },
  digestPointSkeleton: { width: '100%', height: 42, backgroundColor: '#F0EFF4', borderRadius: 12, marginBottom: 8 },

  sectionTitleSkeleton: { width: '30%', height: 20, backgroundColor: '#DDD', borderRadius: 6, marginBottom: 12, marginLeft: 2 },

  topicCardSkeleton: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E4E5E7', paddingHorizontal: 18, paddingVertical: 18, marginBottom: 14 },
  topicTitleSkeleton: { width: '70%', height: 20, backgroundColor: '#E6E6E6', borderRadius: 6, marginBottom: 8 },
  topicDescSkeleton: { width: '100%', height: 34, backgroundColor: '#F4F4F4', borderRadius: 8, marginBottom: 12 },
  topicMetaSkeleton: { width: '32%', height: 14, backgroundColor: '#ECECEC', borderRadius: 6 },
});
