import { TweetPostsResponse } from '../models/Tweet'
import { PostCardModel } from '../screens/TopicDetailScreen'

export function parseTweetsResponse(data: TweetPostsResponse): PostCardModel[] {
  if (!data?.tweets || !Array.isArray(data.tweets)) {
    return []
  }

  return data.tweets.map((tweet) => ({
    id: tweet.tweet_id,
    source: 'Twitter',
    title: cleanTweetText(tweet.text),
    author: tweet.name,
    tag: inferTagFromTweet(tweet.text),
    likes: formatCount(tweet.like_count),
    url: `https://twitter.com/${tweet.username}/status/${tweet.tweet_id}`,
  }))
}

function cleanTweetText(text: string): string {
  if (!text) return ''

  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferTagFromTweet(text: string): string {
  const lower = text.toLowerCase()

  if (
    lower.includes('ai') ||
    lower.includes('regulation') ||
    lower.includes('consumer') ||
    lower.includes('policy')
  ) {
    return 'Consumer impact'
  }

  if (lower.includes('nba') || lower.includes('champion') || lower.includes('league')) {
    return 'Sports'
  }

  if (lower.includes('real madrid') || lower.includes('premier league') || lower.includes('castilla')) {
    return 'Football'
  }

  return 'Trending'
}

function formatCount(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  return value.toLocaleString()
}