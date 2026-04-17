export type TweetPost = {
  tweet_id: string
  author_id: string
  username: string
  name: string
  created_at: string
  text: string
  possibly_sensitive: boolean
  retweet_count: number
  reply_count: number
  like_count: number
  quote_count: number
  bookmark_count: number
  impression_count: number
}

export type TweetPostsResponse = {
  tweets?: TweetPost[]
  meta?: {
    next_token?: string
    result_count?: number
    newest_id?: string
    oldest_id?: string
  }
}