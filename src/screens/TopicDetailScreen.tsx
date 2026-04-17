import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTwitterData } from '../hooks/useTwitterData'
import LinearGradient from 'react-native-linear-gradient'

const PRIMARY = '#5448B7'
const PRIMARY_TEXT = '#6D28D9'
const BG = '#F8F8FB'
const TEXT = '#1F2937'
const MUTED = '#667085'
const BORDER = '#E6E8EC'
const LIGHT_PURPLE = '#F5F1FB'
const LIGHT_BLUE = '#F0F9FF'
const TAG_BG = '#F8F4FF'
const TAG_BORDER = '#E9D8FD'

export type PostCardModel = {
  id: string
  source: 'Twitter' | 'Reddit' | 'Youtube'
  title: string
  author: string
  tag: string
  likes: string
  url?: string
}

const mockPosts: PostCardModel[] = [
  {
    id: '1',
    source: 'Twitter',
    title: `The real issue with AI regulation isn't whether we need it, but who gets to define the rules...`,
    author: 'John Doe',
    tag: 'Consumer impact',
    likes: '2,400',
  },
  {
    id: '2',
    source: 'Reddit',
    title: `Unpopular opinion: Most AI "safety" concerns are overblown. The real risk is...`,
    author: 'Jane Smith',
    tag: 'Consumer impact',
    likes: '1,820',
  },
  {
    id: '3',
    source: 'Youtube',
    title: `New research shows AI systems inherit more than capabilities — they inherit incentives...`,
    author: 'AI Research Team',
    tag: 'Consumer impact',
    likes: '980',
    url: 'https://www.youtube.com/watch?v=example',
  },
]

function SummaryTag({ label }: { label: string }) {
  return (
    <View style={styles.summaryTag}>
      <Text style={styles.summaryTagText}>{label}</Text>
    </View>
  )
}

function TopicTag({ label }: { label: string }) {
  return (
    <View style={styles.topicTag}>
      <Text style={styles.topicTagText}>{label}</Text>
    </View>
  )
}

function SourceIcon({ source }: { source: 'Twitter' | 'Reddit' | 'Youtube' }) {
  if (source === 'Twitter') {
    return <Feather name="twitter" size={15} color={MUTED} />
  }

  if (source === 'Reddit') {
    return <Ionicons name="chatbubble-outline" size={15} color={MUTED} />
  }

  return <Feather name="message-circle" size={15} color={MUTED} />
}

function PostCard({ source, title, author, tag, likes, url }: PostCardModel) {

  const openURL = () => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  }

  return (
    <View style={styles.postCard}>
      <View style={styles.sourceRow}>
        <SourceIcon source={source} />
        <Text style={styles.sourceLabel}> Via {source}</Text>
      </View>

      <Text style={styles.postTitle} numberOfLines={10}>
        {title}
      </Text>

      <Text style={styles.postAuthor}>{author}</Text>

      <View style={styles.postFooter}>
        <TopicTag label={tag} />

        <View style={styles.rightFooter}>
          <View style={styles.likeRow}>
            <AntDesign name="like" size={18} color={MUTED} />
            <Text style={styles.likesText}> {likes}</Text>
          </View>

          <TouchableOpacity style={styles.viewButton}>
            <Feather name="external-link" size={18} color={PRIMARY} />
            <Text style={styles.viewText} onPress={openURL}>
              View
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default function TopicDetailScreen() {

  const route = useRoute()
  const navigation = useNavigation()

  const [isLoading, setIsLoading] = useState(false)
  const { fetchGetTimeline } = useTwitterData()
  const [cardData, setCardData] = useState<PostCardModel[]>([])
  const [summaryByAI, setSummaryByAI] = useState('')
  const [summaryTags, setSummaryTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const { topicTitle, summary, postCount, topicId } = route.params as {
    topicTitle: string
    summary: string
    postCount: number
    topicId?: string
  }

  const getTimeline = async () => {
    try {
      setIsLoading(true)
      const data = await fetchGetTimeline()
      setCardData(data)
    } catch (err) {
      console.error('Error fetching timeline:', err)
      setError('Failed to load posts. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const updatedTime = 'Updated 2h ago'

  useEffect(() => {
    if (topicId != 'raw') {
      console.log('Fetching timeline for topicId:', topicId)
      setCardData(mockPosts)
      setSummaryByAI('New EU AI regulations announced. Tech companies push back on compliance timelines.')
      setSummaryTags(['Industry pushback', 'Regulatory focus', 'Consumer impact'])
    } else {
      setSummaryByAI('This is just a feed of posts without AI curation, so no summary is available. Scroll through the posts to see the unfiltered content stream from all sources.')
      setSummaryTags([])
      getTimeline()
    }
  }, [])

  return (
    <>
      <View style={styles.headerCard}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {topicTitle}
            </Text>
            <Text style={styles.subtitle}>
              {updatedTime} • {postCount} posts
            </Text>
          </View>
        </View>
        <View style={styles.credibilityRow}>
          <View style={styles.orangeDot} />
          <Text style={styles.credibilityText}>Source credibility: Mixed</Text>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={MUTED}
            style={styles.infoIcon}
          />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <LinearGradient colors={[LIGHT_PURPLE, LIGHT_BLUE]} start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }} style={styles.summaryCard}>
          <View style={styles.summaryWrapper}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconWrap}>
                <MaterialCommunityIcons
                  name="star-four-points-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.summaryTitle}>Scrolis Summary</Text>
            </View>

            <Text style={styles.summaryBody}>
              {summaryByAI}
            </Text>

            <View style={styles.summaryTagsRow}>
              {summaryTags.length === 0 ? (
                <Text style={{ color: MUTED, fontSize: 15, fontWeight: '500' }}>
                  No summary tags available for raw feed.
                </Text>
              ) : (
                summaryTags.map((tag, index) => (
                  <SummaryTag key={index} label={tag} />
                ))
              )}

            </View>
          </View>
        </LinearGradient>

        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          cardData.map((card) => <PostCard key={card.id} {...card} />)
        )}

      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({

  headerCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    marginBottom: 20,
    // position: 'absolute',
    // top: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 120,
  },

  metaTopRow: {
    marginBottom: 5,
  },
  metaText: {
    fontSize: 16,
    color: MUTED,
    fontWeight: '500',
  },

  credibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
    paddingLeft: 20,
  },
  orangeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    marginRight: 12,
  },
  credibilityText: {
    fontSize: 15,
    color: '#475467',
    fontWeight: '600',
  },
  infoIcon: {
    marginLeft: 8,
  },
  summaryWrapper: {
    padding: 16,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  summaryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
  },
  summaryBody: {
    fontSize: 16,
    lineHeight: 20,
    color: TEXT,
    fontWeight: '500',
    marginBottom: 18,
  },
  summaryTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTag: {
    borderWidth: 1,
    borderColor: TAG_BORDER,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  summaryTagText: {
    fontSize: 15,
    color: '#344054',
    fontWeight: '600',
  },

  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourceLabel: {
    fontSize: 15,
    color: MUTED,
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 16,
    lineHeight: 18,
    color: '#182033',
    fontWeight: '500',
    marginBottom: 10,
  },
  postAuthor: {
    fontSize: 15,
    color: MUTED,
    marginBottom: 18,
    fontWeight: '500',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicTag: {
    backgroundColor: TAG_BG,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  topicTagText: {
    fontSize: 14,
    color: PRIMARY_TEXT,
    fontWeight: '700',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  likesText: {
    fontSize: 15,
    color: MUTED,
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '700',
  },
})