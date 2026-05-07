import { ImageSourcePropType } from 'react-native'
import { Media, Topic } from '../models/Analysis'

export type FeedPost = {
  id: string
  source: 'Twitter' | 'Reddit'
  displayName: string
  handleLine: string
  timeAgo: string
  body: string
  likes: string
  reposts: string
  comments: string
  isVerified?: boolean
  subreddit?: string
  trendLabel?: string
  media?: ImageSourcePropType
  url?: string
  profileImageUrl?: string
}

// ---------- helpers ----------
const formatCount = (num?: number | null): string => {
  if (!num) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}

const getTimeAgo = (dateString: string): string => {
  const created = new Date(dateString).getTime()
  const now = Date.now()
  const diffMins = Math.floor((now - created) / 1000 / 60)

  if (diffMins < 60) return `${diffMins}m`
  const hours = Math.floor(diffMins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

const getMedia = (
  media?: Media[]
): ImageSourcePropType | undefined => {
  if (!media?.length) return undefined

  // use first media item
  return {
    uri: media[0].url
  }
}

// ---------- mapper ----------
export const mapTopicToFeedPosts = (
  topic: Topic
): FeedPost[] => {
  return topic.representative_posts.map(post => {
    const isTwitter = post.platform === 'twitter'

    return {
      id: post.post_id,
      profileImageUrl: post.profile_image_url ? post.profile_image_url.replace("_normal", "") : undefined,
      source: isTwitter ? 'Twitter' : 'Reddit',

      displayName:
        post.name ||
        post.author ||
        post.username ||
        'Unknown',

      handleLine: isTwitter
        ? `@${post.username ?? ''}`
        : `u/${post.author ?? ''}`,

      timeAgo: getTimeAgo(post.created_at),

      body:
        post.title && post.selftext
          ? `${post.title}\n\n${post.selftext}`
          : post.title || post.text,

      likes: formatCount(
        isTwitter
          ? post.like_count
          : post.ups
      ),

      reposts: formatCount(
        isTwitter
          ? post.retweet_count
          : 0
      ),

      comments: formatCount(
        isTwitter
          ? post.reply_count
          : post.num_comments
      ),

      isVerified: post.verified ?? undefined,

      subreddit: post.subreddit ? `r/${post.subreddit}` : undefined,

      trendLabel: isTwitter
        ? post.retweet_count && post.retweet_count > 1000
          ? `1000+ Trending`
          : undefined
        : post.ups && post.ups > 1000
          ? `1000+ Trending`
          : undefined,

      media: getMedia(post.media),

      url: isTwitter
        ? `https://twitter.com/${post.username}/status/${post.post_id}`
        : post.permalink
          ? `https://reddit.com${post.permalink}`
          : undefined
    }
  })
}

export const getOrdinal = (day: number) => {
  if (day > 3 && day < 21) return 'th';

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};