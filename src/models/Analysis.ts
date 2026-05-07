export interface TopicDigestResponse {
  topics: Topic[];
  total_posts_processed: number;
  digest: string;
}

export interface QueryItem {
  platform: string | null;
  query_string: QueryStringPayload;
}

export interface QueryStringPayload {
  query_string: string;
  intent?: string;
  metadata?: {
    stance?: string;
  };
  platform?: string;
  probability?: number;
  source_keywords?: string[];
  source_topic_id?: number;
}

export interface Topic {
  topic_id: number;
  headline: string;
  category: string;
  short_summary: string;
  long_summary: string;
  keywords: string[];
  key_points: string[];
  n_posts: number;
  n_perspectives: number;
  representative_posts: RepresentativePost[];
  queries: QueryItem[];
}

export interface RepresentativePost {
  text: string;
  platform: "twitter" | "reddit";
  sub_perspective: number;
  engagement_norm: number;
  post_id: string;
  created_at: string;
  enriched: boolean;

  // media
  media: Media[];
  has_media: boolean;

  // author/user (twitter or reddit)
  author: string | null;
  username: string | null;
  name: string | null;
  verified: boolean | null;
  profile_image_url: string | null;

  // reddit-specific
  subreddit: string | null;
  permalink: string | null;
  title: string | null;
  selftext: string | null;
  ups: number | null;
  num_comments: number | null;
  upvote_ratio: number | null;

  // twitter metrics
  retweet_count: number | null;
  reply_count: number | null;
  like_count: number | null;
  quote_count: number | null;
  bookmark_count: number | null;
  impression_count: number | null;
}

export interface Media {
  type: MediaType;
  url: string;

  // twitter media
  media_key?: string;

  // reddit video extras
  hls_url?: string;
  dash_url?: string;
  width?: number;
  height?: number;
  duration?: number;
  has_audio?: boolean;
}

export type MediaType =
  | "photo"
  | "image"
  | "video"
  | "animated_gif";


export type QueryRequest= {
  query_string: string;
  platform: "twitter" | "reddit";
}

export type DifferentPerspectiveRequest = {
  topic_id: number;
  keywords: string[];
  queries: QueryRequest[];
}

export type DifferentPerspectiveResponse = {
  topic_id: number;
  wandering: Topic;
  uncharted: Topic;
}


export type HistoricalTopic = {
  category: string;
  count: number;
  percentage: number;
};

export type HistoricalTopicsResponse = {
  historicalTopics: HistoricalTopic[];
};

export interface TopicDigest {
  topicId: number;
  headline: string;
  category: string;
  shortSummary: string;
  keywords: string[];
  nPosts: number;
  nPerspectives: number;
}

export interface HistoricalDigest {
  date: string;
  userId: string;
  createdAt: string;
  snapshottedAt: string;
  summary: string;
  topics: TopicDigest[];
  weekday: string;
}

export interface HistoricalDigestResponse {
  historicalDigests: HistoricalDigest[];
}
