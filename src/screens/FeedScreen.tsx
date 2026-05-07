import React, { useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { FeedStackParamList } from '../navigators/FeedStackNavigator'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAnalysisResult } from '../contexts/AnalysisContext'
import { RepresentativePost, Topic, TopicDigestResponse } from '../models/Analysis'
import { useAppAuthContext } from '../contexts/AppAuthContext'
import { useAuthentication } from '../hooks/useAuthentication'
import { getOrdinal } from '../utils/FeedPostHelper'

type FeedScreenNavProp = NativeStackNavigationProp<
    FeedStackParamList,
    'FeedHome'
>

type TopicView = {
    id: number;
    category: string;
    headline: string;
    postCount: number;
    summary: string;
    updatedAgo: string;
}

export default function FeedScreen() {
    const navigation = useNavigation<FeedScreenNavProp>()
    const { analysis } = useAnalysisResult();
    const [feedTopics, setFeedTopics] = React.useState<TopicView[]>([]);
    const [digestSummary, setDigestSummary] = React.useState<string>("")
    const [currentDate, setCurrentDate] = React.useState<string>("");
    const [loginStreak, setLoginStreak] = React.useState<number>(0);
    const { getLoginStreak } = useAuthentication();


    const navigateToTopicDetail = (topicId: number) => {
        console.log('Navigating to TopicDetail with topicId:', topicId);
        navigation.navigate("TopicDetail", {
            topicId: topicId,
        })
    }

    const getLatestUpdateTime = (topic: Topic): string => {
        const mostRecentPost = topic.representative_posts.reduce((latest, post) => {
            const postDate = new Date(post.created_at);
            return postDate > latest ? postDate : latest;
        }, new Date(0));

        const now = new Date();
        const diffInMs = now.getTime() - mostRecentPost.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        return `${diffInHours}h ago`;
    }

    const parseAnalysisToFeedTopics = (analysis: TopicDigestResponse): TopicView[] => {
        return analysis.topics.map((topic: Topic) => ({
            id: topic.topic_id,
            category: topic.category,
            headline: topic.headline,
            summary: topic.short_summary,
            postCount: topic.n_posts,
            updatedAgo: getLatestUpdateTime(topic),
        }));
    }

    useEffect(() => {
        if (analysis) {
            const date = new Date();
            const formattedDate = `${date.toLocaleDateString('en-US', {
                month: 'long',
            })} ${date.getDate()}${getOrdinal(date.getDate())}`;

            setCurrentDate(formattedDate);
            setDigestSummary(analysis.digest);
            setFeedTopics(parseAnalysisToFeedTopics(analysis));
        }
    }, [analysis]);

    useEffect(() => {
        const fetchLoginStreak = async () => {
            const streak = await getLoginStreak();
            console.log("Fetched login streak:", streak);
            setLoginStreak(streak);
        };

        fetchLoginStreak();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screen}>
                <View style={styles.topBar}>
                    <View style={styles.brandRow}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.logo}>Scrolis</Text>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* New dark header digest section */}
                    <View style={styles.digestHeaderBg}>
                        <Image
                            source={require('../assets/feed-bubble.png')}
                            style={styles.headerBubble}
                            resizeMode="cover"
                        />
                        <View style={styles.headerContent}>
                            <Text style={styles.digestTitle}>Hey, it&apos;s {currentDate}.</Text>
                            <Text style={styles.digestSubtitle}>{feedTopics.length} Things Worth Knowing</Text>
                            <Text style={styles.headerDescription}>
                                {digestSummary}
                            </Text>

                            {/* Streak Badge */}
                            {(loginStreak ?? 0) > 0 && (
                                <View style={styles.streakBadge}>
                                    <Text style={styles.streakEmoji}>🔥</Text>
                                    <Text style={styles.streakBadgeText}>{loginStreak}-day streak — you're locked in!</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.topicsListContainer}>
                        {feedTopics.map((topic, index) => (
                            <TouchableOpacity
                                key={`${topic.id}-${index}`}
                                style={styles.topicListItem}
                                onPress={() => navigateToTopicDetail(topic.id)}
                            >
                                <View style={styles.topicNumber}>
                                    <Text style={styles.topicNumberText}>
                                        {(index + 1).toString().padStart(2, '0')}
                                    </Text>
                                </View>
                                <View style={styles.topicListContent}>
                                    <Text style={styles.topicListTitle}>{topic.headline}</Text>
                                    <Text style={styles.topicListDescription}>{topic.summary}</Text>
                                    <View style={styles.topicListMeta}>
                                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                                        <Text style={styles.topicListTime}>{topic.updatedAgo}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    screen: {
        flex: 1,
        backgroundColor: '#F5F3EE',
    },
    topBar: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 22,
        paddingTop: 14,
        paddingBottom: 16,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
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
    scrollContent: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 140,
    },
    digestHeaderBg: {
        backgroundColor: '#26215C',
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    headerBubble: {
        position: 'absolute',
        right: 0,
    },
    headerContent: {
        position: 'relative',
        zIndex: 1,
    },
    digestTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        lineHeight: 36,
        fontWeight: '700',
        marginBottom: 8,
    },
    digestSubtitle: {
        color: '#E9E8FF',
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '600',
        marginBottom: 8,
    },
    headerDescription: {
        color: '#D0CCFF',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        marginBottom: 12,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF20',
        borderColor: '#FFFFFF20',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    streakEmoji: {
        fontSize: 16,
        marginRight: 8,
    },
    streakBadgeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '500',
    },
    topicsListContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    topicListItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    topicNumber: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EEEDFD',
        borderWidth: 1,
        borderColor: '#5147C420',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    topicNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3D3B5C',
    },
    topicListContent: {
        flex: 1,
    },
    topicListTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    topicListDescription: {
        fontSize: 15,
        color: '#666666',
        lineHeight: 18,
        marginBottom: 6,
        fontWeight: '400',
    },
    topicListMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    topicListTime: {
        fontSize: 12,
        color: '#6B6B6B',
        fontWeight: '400',
    },
    digestBanner: {
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
    dismissButton: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    digestBannerText: {
        color: '#30334A',
        fontSize: 12,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 4,
        paddingHorizontal: 24,
        fontWeight: '500',
    },
    addAccountText: {
        color: '#4E48BD',
        fontSize: 11,
        fontWeight: '700',
    },
    digestCard: {
        backgroundColor: '#F7F7F8',
        borderRadius: 20,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 20,
    },
    digestText: {
        color: '#2F3135',
        fontSize: 16,
        lineHeight: 30,
        fontWeight: '500',
        marginBottom: 14,
    },
    digestPointRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D5D2EF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    digestPointNumber: {
        color: '#2E2A6B',
        fontSize: 18,
        lineHeight: 22,
        fontWeight: '800',
        marginRight: 12,
        minWidth: 26,
    },
    digestPointText: {
        flex: 1,
        color: '#2E2A6B',
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '600',
    },
    streakCard: {
        marginTop: 10,
        backgroundColor: '#29256B',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakTitle: {
        color: '#F8F7FF',
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '700',
    },
    streakText: {
        color: '#F8F7FF',
        fontSize: 10,
        lineHeight: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        color: '#1F2328',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '800',
        marginBottom: 12,
        marginLeft: 18,
        paddingHorizontal: 0,
    },
    topicCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: '#E4E5E7',
        marginBottom: 14,
        marginHorizontal: 16,
        shadowColor: '#101828',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    topicTitle: {
        fontSize: 20,
        lineHeight: 30,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    topicDescription: {
        fontSize: 16,
        lineHeight: 22,
        color: '#6B6B6B',
        fontWeight: '400',
        marginBottom: 12,
    },
    cardMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        columnGap: 18,
        rowGap: 8,
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaIcon: {
        marginRight: 8,
    },
    metaLineText: {
        color: '#7A7A7A',
        fontSize: 15,
        fontWeight: '500',
    },
})