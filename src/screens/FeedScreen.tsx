import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { FeedStackParamList } from '../navigators/FeedStackNavigator'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

type FeedScreenProps = {
    onPressExplore?: () => void
}

const PRIMARY = '#5448B7'
const TEXT = '#182033'
const MUTED = '#667085'
const BORDER = '#E6E8EC'

type FeedScreenNavProp = NativeStackNavigationProp<
  FeedStackParamList,
  'FeedHome'
>

export default function FeedScreen({ onPressExplore }: FeedScreenProps) {
    const navigation = useNavigation<FeedScreenNavProp>()

    const navigateToTopicDetail = (topicTitle: string, summary: string, postCount: number, topicId?: string) => {
        navigation.navigate("TopicDetail", {
            topicTitle: topicTitle,
            summary: summary,
            postCount: postCount,
            topicId: topicId,
        })
    }
    return (
        <>
            <View style={styles.topBar}>
                <Text style={styles.logo}>Scrolis</Text>
                <TouchableOpacity style={styles.topIconButton}>
                    <Feather name="sliders" size={24} color="#667085" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <Feather name="search" size={22} color="#98A2B3" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search topics..."
                    placeholderTextColor="#98A2B3"
                    style={styles.searchInput}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                <View style={styles.digestCard}>
                    <Text style={styles.digestTitle}>Today's Digest</Text>
                    <Text style={styles.digestDate}>Monday, March 2, 2026</Text>

                    <Text style={styles.digestLabel}>IN TODAY'S DIGEST</Text>
                    <Text style={styles.digestText}>
                        Covering AI & Machine Learning, Climate & Sustainability, Housing &
                        Urban Development + 2 more
                    </Text>
                </View>

                <View style={styles.perspectiveCard}>
                    <View style={styles.perspectiveIconWrap}>
                        <MaterialCommunityIcons
                            name="compass-outline"
                            size={24}
                            color="#5B4DB2"
                        />
                    </View>

                    <View style={styles.perspectiveContent}>
                        <Text style={styles.perspectiveText}>
                            You've read mostly similar sources today. Want to mix it up?
                        </Text>

                        <TouchableOpacity style={styles.primaryButton} onPress={onPressExplore}>
                            <Text style={styles.primaryButtonText}>
                                Explore diverse perspectives
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Text style={styles.secondaryText}>Not now</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.topicCard} onPress={() => navigateToTopicDetail('AI & Machine Learning', 'New EU AI regulations announced...', 30, '1')}>
                    <Text style={styles.topicTitle}>AI & Machine Learning</Text>
                    <Text style={styles.topicDescription}>
                        New EU AI regulations announced. Tech companies push back on
                        compliance...
                    </Text>

                    <View style={styles.sourceRow}>
                        <View style={styles.inlineRow}>
                            <Feather name="twitter" size={16} color="#667085" />
                            <Text style={styles.sourceText}> via X</Text>
                        </View>

                        <View style={styles.inlineRow}>
                            <Ionicons name="chatbubble-outline" size={16} color="#667085" />
                            <Text style={styles.sourceText}> via Reddit</Text>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.inlineRow}>
                            <View style={styles.greenDot} />
                            <Text style={styles.metaText}>Verified sources</Text>
                            <Ionicons
                                name="information-circle-outline"
                                size={16}
                                color="#98A2B3"
                                style={{ marginLeft: 4 }}
                            />
                        </View>

                        <View style={styles.inlineRow}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={16}
                                color="#667085"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.metaText}>30 posts</Text>
                        </View>
                    </View>

                    <View style={styles.inlineRow}>
                        <Feather name="clock" size={16} color="#98A2B3" />
                        <Text style={styles.timeText}> Updated 2h ago</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.topicCard}>
                    <Text style={styles.topicTitle}>Climate & Sustainability</Text>
                    <Text style={styles.topicDescription}>
                        Latest IPCC report shows faster warming trends across key regions...
                    </Text>
                </View>
                
                <TouchableOpacity style={styles.topicCard} onPress={() => navigateToTopicDetail('All Posts (Just for Testing)', 'New EU AI regulations announced...', 100, 'raw')}>
                    <Text style={styles.topicTitle}>All Posts (Just for Testing)</Text>
                    <Text style={styles.topicDescription}>
                        Click here to read the  posts before doing topic modelling from all sources. No AI summaries, just the raw content stream.
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
    },
    logo: {
        fontSize: 24,
        fontWeight: '700',
        color: TEXT,
    },
    topIconButton: {
        width: 36,
        alignItems: 'flex-end',
    },
    searchWrapper: {
        marginHorizontal: 20,
        marginBottom: 18,
        height: 56,
        borderRadius: 18,
        backgroundColor: '#F1F2F6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        color: TEXT,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 140,
    },
    digestCard: {
        backgroundColor: PRIMARY,
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
    },
    digestTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
    },
    digestDate: {
        color: '#E7E3FF',
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 10,
    },
    digestLabel: {
        color: '#C9C2FF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 14,
    },
    digestText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 18,
        fontWeight: '600',
    },
    perspectiveCard: {
        backgroundColor: '#F4EFFB',
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8DDF8',
    },
    perspectiveIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        marginTop: 2,
    },
    perspectiveContent: {
        flex: 1,
    },
    perspectiveText: {
        fontSize: 16,
        lineHeight: 28,
        color: TEXT,
        marginBottom: 16,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: PRIMARY,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 999,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    secondaryText: {
        color: MUTED,
        fontSize: 15,
        fontWeight: '600',
    },
    topicCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 22,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 20,
    },
    topicTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: TEXT,
        marginBottom: 16,
    },
    topicDescription: {
        fontSize: 18,
        lineHeight: 30,
        color: '#475467',
        fontWeight: '500',
        marginBottom: 20,
    },
    sourceRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 18,
        flexWrap: 'wrap',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 18,
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sourceText: {
        color: MUTED,
        fontSize: 16,
        fontWeight: '600',
    },
    metaText: {
        color: '#475467',
        fontSize: 16,
        fontWeight: '600',
    },
    timeText: {
        color: '#98A2B3',
        fontSize: 16,
        fontWeight: '500',
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#12B76A',
        marginRight: 8,
    },
})