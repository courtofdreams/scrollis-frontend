import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons, Feather, MaterialIcons, AntDesign } from '@expo/vector-icons'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTwitterData } from '../hooks/useTwitterData'
import { themeColors } from '../utils/Theme'
import { useAnalysisResult } from '../contexts/AnalysisContext'
import { QueryItem, QueryRequest, Topic } from '../models/Analysis'
import { FeedPost, mapTopicToFeedPosts } from '../utils/FeedPostHelper'
import { useAnalysis } from '../hooks/useAnalysis'

type FeedTab = 'Your Feed' | 'Wandering' | 'Uncharted'

const TABS: FeedTab[] = ['Your Feed', 'Wandering', 'Uncharted']
const { width: SCREEN_WIDTH } = Dimensions.get('window')

const PAGE_BG = themeColors.background
const CARD_BG = '#FFFFFF'
const BORDER = '#E3E3E8'
const MUTED = '#6B7280'
const TEXT = '#1F2328'
const PRIMARY = '#4E48BD'

type SourceType = 'Twitter' | 'Reddit' | 'Youtube'

export type PostCardModel = {
  id: string
  source: SourceType
  title: string
  author: string
  tag: string
  likes: string
  url?: string
}

// function derivePostsForTab(posts: FeedPost[], tab: FeedTab): FeedPost[] {
//   if (posts.length === 0) {
//     return []
//   }

//   if (tab === 'Your Feed') {
//     return posts
//   }

//   if (tab === 'Wandering') {
//     const shifted = posts.length > 1 ? [...posts.slice(1), posts[0]] : [...posts]

//     return shifted.map((post, index) => ({
//       ...post,
//       id: `wandering-${post.id}`,
//       trendLabel: index % 2 === 0 ? 'Cross-perspective' : post.trendLabel,
//       timeAgo: `${index + 7}h ago`,
//       body:
//         post.source === 'Reddit'
//           ? `${post.body} More adjacent communities are adding context to this topic.`
//           : `${post.body} Experts outside your usual circles are adding nuance to this view.`,
//     }))
//   }

//   return [...posts].reverse().map((post, index) => ({
//     ...post,
//     id: `uncharted-${post.id}`,
//     trendLabel: 'Unexpected angle',
//     timeAgo: `${index + 9}h ago`,
//     body: `${post.body} This perspective is less represented in your default feed.`,
//   }))
// }


function InfoCard({ summary, title, postCount }: { summary: string; title: string; postCount: number }) {
  return (
    <View style={styles.feedTakeCard}>
      <View style={styles.feedTakeHeader}>
        <View style={styles.feedTakeIconWrap}>
          <Image source={require('../assets/logo-white.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
        </View>
        <View>
          <Text style={styles.feedTakeTitle}>{title}</Text>
          <Text style={styles.feedTakeSubTitle}>Synthesized from {postCount} posts.</Text>
        </View>
      </View>
      <Text style={styles.feedTakeBody}>{summary}</Text>
    </View>
  )
}

function FeedPostCard({ post }: { post: FeedPost }) {
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [measuredLines, setMeasuredLines] = useState(0)
  const prevOverflowRef = useRef<boolean | null>(null)
  const videoUri = (post.media as any)?.uri
  const videoPlayer = useVideoPlayer(videoUri ? { uri: videoUri } : null)
  const openUrl = () => {
    if (!post.url) {
      return
    }

    Linking.openURL(post.url).catch((err) => {
      console.error('Failed to open URL:', err)
    })
  }

  return (
    <TouchableOpacity onPress={openUrl}>
      <View style={styles.postCard}>
        {post.trendLabel ? (
          <View style={styles.trendRow}>
            <MaterialIcons name="trending-up" size={20} color="#19B9A7" />
            <Text style={styles.trendText}>{post.trendLabel}</Text>
          </View>
        ) : null}

        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            {post.profileImageUrl ? (
              <Image source={{ uri: post.profileImageUrl }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarText}>{post.displayName[0]?.toUpperCase() || 'U'}</Text>
            )}
          </View>

          <View style={styles.userMetaBlock}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{post.displayName}</Text>
              {post.isVerified && post.source === 'Twitter' ? (
                <Ionicons name="checkmark-circle" size={16} color="#1D9BF0" style={styles.inlineSpacer} />
              ) : null}
            </View>

            <View style={styles.userHandleRow}>
              <Text style={styles.userHandle}>{post.handleLine}</Text>
              {post.subreddit ? (
                <>
                  <Text style={styles.dotSeparator}> • </Text>
                  <Text numberOfLines={1} style={styles.subredditText}>{post.subreddit}</Text>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.platformWrap}>
            {post.source === 'Twitter' ? (
              <AntDesign name="x" size={20} color="#1D9BF0" />
            ) : (
              <Ionicons name="logo-reddit" size={20} color="#FF5700" />
            )}
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>
        </View>

        {/** Collapse excessive blank lines to avoid huge whitespace */}
        {(() => {
          const displayBody = post.body ? post.body.replace(/\n{3,}/g, '\n\n').trim() : ''

          return (

            <View style={[styles.postBodyWrap, isOverflowing ? styles.postBodyWrapFixed : undefined]}>
              <Text
                style={styles.postBody}
                onTextLayout={(e) => {
                  // Only measure once to avoid layout-measure loops that cause flicker
                  if (prevOverflowRef.current !== null) return

                  const lines = e.nativeEvent.lines.length
                  setMeasuredLines(lines)
                  const overflowing = lines > 10
                  prevOverflowRef.current = overflowing
                  setIsOverflowing(overflowing)
                }}
              >
                {displayBody}
              </Text>
              {(() => {
                if (videoUri && /\.(mp4|mov|m3u8)(\?|$)/i.test(videoUri)) {
                  return (
                    <VideoView player={videoPlayer} style={styles.postMedia} nativeControls contentFit="cover" />
                  )
                }

                return post.media ? <Image source={post.media} style={styles.postMedia} resizeMode="cover" /> : null
              })()}
              {isOverflowing && post.url ? (
                <View style={styles.bodyOverlay} pointerEvents="box-none">
                  <View style={styles.bodyFade} />
                  <TouchableOpacity style={styles.seeMoreOverlayButton} onPress={openUrl}>
                    <Text style={styles.seeMoreText}>See more ↗</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )
        })()}

        <View style={styles.postActionRow} />
      </View>
    </TouchableOpacity>
  )
}

type TabBodyProps = {
  infoText: string
  takeTitle: string
  summaryText: string
  isLoading: boolean
  error: string | null
  feedPosts: FeedPost[]
  numberOfSynthesizedPosts: number
  scrollEnabled?: boolean
}

function TabBody({ infoText, takeTitle, summaryText, isLoading, error, feedPosts, numberOfSynthesizedPosts, scrollEnabled = true }: TabBodyProps) {
  const showPosts = !isLoading && !error
  const listData = showPosts ? feedPosts : []

  return (
    <FlatList
      data={listData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FeedPostCard post={item} />}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      contentContainerStyle={styles.tabListContent}
      ListHeaderComponent={
        <>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={17} color={PRIMARY} />
            <Text style={styles.infoText}>{infoText}</Text>
          </View>

          <InfoCard summary={summaryText} title={takeTitle} postCount={numberOfSynthesizedPosts} />

          <Text style={styles.postsSectionTitle}>Posts From This Perspective</Text>

          {isLoading ? <Text style={styles.statusText}>Loading posts...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </>
      }
      ListEmptyComponent={
        !isLoading && !error ? (
          <Text style={styles.statusText}>No posts available yet.</Text>
        ) : null
      }
    />
  )
}

type FeedTabConfig = {
  infoText: string
  takeTitle: string
  summary: string
  representativePosts?: FeedPost[]
  synthesizedPostCount?: number
}

const DEFAULT_TAB_CONFIGS: Record<FeedTab, FeedTabConfig> = {
  'Your Feed': {
    infoText: 'Perspectives your feed already surfaces.',
    takeTitle: "Your Feed's Take",
    summary: '',
    representativePosts: [],
    synthesizedPostCount: 0,
  },
  Wandering: {
    infoText: 'Balancing your feed with new insights.',
    takeTitle: "Wandering's Take",
    summary: '',
    representativePosts: [],
    synthesizedPostCount: 0,
  },
  Uncharted: {
    infoText: 'Uncovering perspectives beyond your usual.',
    takeTitle: "Uncharted's Take",
    summary: '',
    representativePosts: [],
    synthesizedPostCount: 0,
  },
}


export default function TopicDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<FeedTab>('Your Feed')
  const [cardData, setCardData] = useState<PostCardModel[]>([])
  const [error, setError] = useState<string | null>(null)
  const pagerRef = useRef<FlatList<FeedTab>>(null)
  const { analysis, differentPerspectives } = useAnalysisResult();
  const { fetchDifferentPerspectives } = useAnalysis()
  const [headline, setHeadline] = useState<string>("")
  const [yourFeedTopic, setYourFeedTopic] = useState<Topic | null>(null)
  const [tabConfigs, setTabConfigs] = useState<Record<FeedTab, FeedTabConfig>>(DEFAULT_TAB_CONFIGS)
  const [isTabContentLoading, setIsTabContentLoading] = useState<Record<FeedTab, boolean>>({
    'Your Feed': false,
    'Wandering': false,
    'Uncharted': false,
  })


  const differentPerspectivesForTopic = useMemo(() => {
    if (!differentPerspectives || !yourFeedTopic) {
      return null
    } else {
      return differentPerspectives.find(dp => dp.topic_id === yourFeedTopic.topic_id) || null
    }
  }, [differentPerspectives, yourFeedTopic])

  const { topicId } = route.params as {
    topicId: number
  }

  const topicInformation = useMemo(() => {
    return analysis?.topics.find((t: Topic) => t.topic_id === topicId) || null;
  }, [analysis, topicId]);


  const pagerData = useMemo(() => TABS, [])

  const handleTabPress = (nextTab: FeedTab) => {
    if (nextTab === activeTab) {
      return
    }

    const nextIndex = TABS.indexOf(nextTab)
    pagerRef.current?.scrollToIndex({ index: nextIndex, animated: true })
    setActiveTab(nextTab)
  }

  const handlePagerMomentumEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    const nextTab = TABS[nextIndex] ?? TABS[0]

    if (nextTab !== activeTab) {
      setActiveTab(nextTab)
    }
  }

  const getQueriesForTopic = (queries: QueryItem[]): QueryRequest[] => {
    if (!queries || queries.length === 0) {
      return [];
    }

    return queries.map((query) => ({
      query_string: query.query_string.query_string, // ✅ correct path
      platform:
        query.query_string.platform === "reddit"
          ? "reddit"
          : "twitter", // ✅ safe fallback
    }));
  };

  useEffect(() => {
    console.log('Current different perspectives data:', differentPerspectives)

    if ((activeTab === 'Wandering' || activeTab === 'Uncharted') && differentPerspectivesForTopic === null) {
      setIsTabContentLoading(prev => ({
        ...prev,
        [activeTab]: true,
      }))

      fetchDifferentPerspectives({
        topic_id: topicId,
        keywords: topicInformation?.keywords || [],
        queries: getQueriesForTopic(topicInformation?.queries || []),
      }).then((data) => {
        console.log('Fetched different perspectives data:', data)
      }).catch((err) => {
        console.error('Error fetching different perspectives:', err)
      }).finally(() => {
        setIsTabContentLoading(prev => ({
          ...prev,
          [activeTab]: false,
        }))
      })

    }
  }, [activeTab, differentPerspectivesForTopic])

  useEffect(() => {
    if (!differentPerspectivesForTopic) {
      return
    }
    else {
      setTabConfigs(prev => ({
        ...prev,
        'Wandering': {
          ...prev['Wandering'],
          summary: differentPerspectivesForTopic.wandering.long_summary,
          representativePosts: mapTopicToFeedPosts(differentPerspectivesForTopic.wandering),
          synthesizedPostCount: differentPerspectivesForTopic.wandering.n_posts,
        },
        'Uncharted': {
          ...prev['Uncharted'],
          summary: differentPerspectivesForTopic.unchanged.long_summary,
          representativePosts: mapTopicToFeedPosts(differentPerspectivesForTopic.unchanged),
          synthesizedPostCount: differentPerspectivesForTopic.unchanged.n_posts,
        },
      }))
    }
  }, [differentPerspectivesForTopic])


  useEffect(() => {
    console.log('Looking for topic with ID:', topicId)
    const topic = topicInformation;
    setYourFeedTopic(topic || null)
    setTabConfigs(prev => ({
      ...prev,
      'Your Feed': {
        ...prev['Your Feed'],
        summary: topic ? topic.long_summary : '',
        representativePosts: topic ? mapTopicToFeedPosts(topic) : [],
        synthesizedPostCount: topic ? topic.n_posts : 0,
      },
    }))

  }, [topicInformation])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrap}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Ionicons name="arrow-back" size={14} color={TEXT} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>{yourFeedTopic?.headline || 'Topic Details'}</Text>
      </View>

      <View style={styles.tabsWrap}>
        {TABS.map((tab) => {
          const isActive = tab === activeTab

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.contentShell}>
        <FlatList
          ref={pagerRef}
          data={pagerData}
          keyExtractor={(item) => item}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlePagerMomentumEnd}
          renderItem={({ item }) => {
            const tanConfig = tabConfigs[item]

            return (
              <View style={styles.page}>
                {isTabContentLoading[item] ? (
                  <View style={{ padding: 20 }}>
                    <Text style={styles.statusText}>Loading {item} content...</Text>
                  </View>
                ) : (
                  <TabBody
                    infoText={tanConfig.infoText}
                    takeTitle={tanConfig.takeTitle}
                    summaryText={tanConfig.summary}
                    isLoading={isLoading}
                    error={error}
                    feedPosts={tanConfig.representativePosts || []}
                    numberOfSynthesizedPosts={tanConfig.synthesizedPostCount || 0}
                  />)}
              </View>
            )
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 40,
    fontWeight: '500',
    color: TEXT,
  },
  screenTitle: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '800',
    color: TEXT,
  },
  tabsWrap: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: PRIMARY,
  },
  tabText: {
    color: '#868686',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
  },
  tabTextActive: {
    color: PRIMARY,
  },
  contentShell: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  page: {
    width: SCREEN_WIDTH - 2,
    flex: 1,
  },
  tabListContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 120,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 2,
    color: PRIMARY,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '500',
  },
  feedTakeCard: {
    backgroundColor: '#EEEDFD',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#B9B6E8',
    padding: 16,
    marginBottom: 22,
  },
  feedTakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedTakeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  feedTakeTitle: {
    color: TEXT,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '800',
  },
  feedTakeSubTitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  feedTakeBody: {
    color: '#1A1A1A',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  postsSectionTitle: {
    color: TEXT,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusText: {
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  errorText: {
    color: '#B42318',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: themeColors.cardBackground,
    borderWidth: 1,
    borderColor: '#DEDEE3',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendText: {
    color: TEXT,
    marginLeft: 8,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3E2DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25, // optional if overflow hidden exists
  },
  avatarText: {
    color: '#25235D',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  userMetaBlock: {
    flex: 1,
    paddingTop: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineSpacer: {
    marginLeft: 6,
  },
  userName: {
    color: TEXT,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
  },
  userHandleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userHandle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  dotSeparator: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
  },
  subredditText: {
    color: '#FF4A00',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    width: 130,
    
  },
  platformWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  timeAgo: {
    marginLeft: 6,
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  postBody: {
    color: '#23262F',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 12,
  },
  postBodyWrap: {
    position: 'relative',
  },
  postBodyWrapFixed: {
    overflow: 'hidden',
    height: 250,
  },
  bodyOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingBottom: 8,
  },
  bodyFade: {
    ...StyleSheet.absoluteFillObject,
    height: 56,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.88)',
    pointerEvents: 'none',
  },
  seeMoreOverlayButton: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    pointerEvents: 'auto',
  },
  postMedia: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
  },
  postActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  metricText: {
    marginLeft: 6,
    color: '#6C6C6C',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  openLinkButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D4D4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeMoreRow: {
    marginTop: 6,
  },
  seeMoreText: {
    color: PRIMARY,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 20,
  },
})
