import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeColors } from '../utils/Theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigators/RootNavigator';
import FlowPagination from '../components/FlowPagination';


const { width } = Dimensions.get('window');
const CONTENT_WIDTH = width - 56;
const FLOW_TOTAL_STEPS = 5;

type OnboardingItem = {
    id: string;
    title: string;
    description: string;
    image: any; // Replace with appropriate type for your images
};

const ONBOARDING_DATA: OnboardingItem[] = [
    {
        id: '1',
        title: 'Your daily digest',
        description:
            'A short list of curated stories that are worth your time.',
        image: require('../assets/onboarding1.png'),
    },
    {
        id: '2',
        title: 'Your feed, unpacked',
        description:
            'Conversations from the people you follow — and every side of those stories.',
        image: require('../assets/onboarding2.png'),
    },
    {
        id: '3',
        title: 'Step outside your bubble',
        description:
            'Start with For You. Wander a little. Or go somewhere Uncharted.',
        image: require('../assets/onboarding3.png'),
    },
];

type SlideProps = {
    item: OnboardingItem;
};

type IllustrationPlaceholderProps = {
    location: any; // Replace with appropriate type for your images
};

function IllustrationPlaceholder({ location }: IllustrationPlaceholderProps) {
    return (
        <Image source={location} style={{ height: 300, width: '100%' }} />
    );
}

function OnboardingSlide({
    item,
}: SlideProps) {
    return (
        <View style={styles.slide}>
            <View style={styles.illustrationSection}>
                <IllustrationPlaceholder location={item.image} />
            </View>

            <View style={styles.contentSection}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );
}

type OnboardingScreenProps = {
    route: {
        params?: {
            currentIndex?: number;
        };
    };
};

export default function OnboardingScreen({ route }: OnboardingScreenProps) {
    const navigation = useNavigation<RootStackNavigationProp>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList<OnboardingItem>>(null);

    const slideTotal = useMemo(() => ONBOARDING_DATA.length, []);

    const scrollToIndex = (index: number, animated: boolean = true) => {
        flatListRef.current?.scrollToIndex({ index, animated });
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (currentIndex < slideTotal - 1) {
            scrollToIndex(currentIndex + 1);
            return;
        }

        navigation.push('CreateAccount');
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            scrollToIndex(currentIndex - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleMomentumScrollEnd = (
        event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        // If previous navigation params include currentIndex, 
        const params = route.params as { currentIndex?: number } | undefined;
        if (params?.currentIndex !== undefined) {
            scrollToIndex(params.currentIndex, false);
        }

    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />

            <View style={styles.shell}>
                <View style={styles.topSection}>
                    <Pressable
                        onPress={handleBack}
                        hitSlop={12}
                        style={styles.backButton}
                    >
                        <Feather name="chevron-left" size={28} color={themeColors.textPrimary} />
                    </Pressable>
                    <FlowPagination currentIndex={currentIndex} total={FLOW_TOTAL_STEPS} />
                    <View style={styles.rightSpacer} />
                </View>

                <View style={styles.middleSection}>
                    <FlatList
                        ref={flatListRef}
                        onScrollToIndexFailed={(info) => {
                            setTimeout(() => {
                                flatListRef.current?.scrollToIndex({
                                    index: info.index,
                                    animated: false,
                                });
                            });
                        }}
                        data={ONBOARDING_DATA}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleMomentumScrollEnd}
                        renderItem={({ item }) => (
                            <OnboardingSlide item={item} />
                        )}
                    />
                </View>

                <TouchableOpacity style={styles.nextButton} activeOpacity={0.85} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>{currentIndex === slideTotal - 1 ? 'Get started' : 'Next'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    shell: {
        flex: 1,
        backgroundColor: themeColors.background,
        paddingHorizontal: 28,
        paddingTop: 12,
        paddingBottom: 28,
    },
    middleSection: {
        flex: 1,
    },
    slide: {
        width: CONTENT_WIDTH,
        flex: 1,
        backgroundColor: themeColors.background,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonSpacer: {
        width: 18,
        height: 18,
    },
    rightSpacer: {
        width: 40,
    },
    arrowWrapper: {
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowLineLeft: {
        position: 'absolute',
        width: 11,
        height: 2.5,
        backgroundColor: themeColors.secondary,
        borderRadius: 2,
        transform: [{ rotate: '-45deg' }, { translateX: -2 }, { translateY: -3 }],
    },
    arrowLineRight: {
        position: 'absolute',
        width: 11,
        height: 2.5,
        backgroundColor: themeColors.secondary,
        borderRadius: 2,
        transform: [{ rotate: '45deg' }, { translateX: -2 }, { translateY: 3 }],
    },
    illustrationSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    illustrationOuter: {
        width: '100%',
        maxWidth: 320,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustrationCircle: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(83, 74, 183, 0.08)',
    },
    illustrationBox: {
        width: 220,
        height: 180,
        borderRadius: 24,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(83, 74, 183, 0.28)',
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustrationText: {
        fontSize: 16,
        color: themeColors.textPurple,
        fontWeight: '600',
    },
    contentSection: {
        alignItems: 'center',
        paddingHorizontal: 8,
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '800',
        color: themeColors.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 28,
        color: themeColors.textPrimary,
        textAlign: 'center',
        maxWidth: 320,
    },
    nextButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: themeColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    nextButtonText: {
        color: themeColors.textWhite,
        fontSize: 18,
        fontWeight: '700',
    },
});
