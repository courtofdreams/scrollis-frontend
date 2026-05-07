import * as SecureStore from 'expo-secure-store';
import { RedditUser, TwitterUser } from '../contexts/AppAuthContext';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const ACCESS_TOKEN_KEY = 'access_token';
const USERNAME_KEY = 'username';
const NAME_KEY = 'name';

const NEED_TO_CONNECTED_SOCIAL_KEY = 'need_to_connected_social';

const TWITTER_ACCESS_TOKEN_KEY = 'twitter_access_token';
const TWITTER_USER_KEY = 'twitter_user';

const REDDIT_ACCESS_TOKEN_KEY = 'reddit_access_token';
const REDDIT_USER_KEY = 'reddit_user';

type StoredValue<T> = {
  data: T;
  expiresAt: number;
};

async function saveWithExpiry<T>(
  key: string,
  value: T,
  ttlMs: number = ONE_DAY_MS
) {
  const payload: StoredValue<T> = {
    data: value,
    expiresAt: Date.now() + ttlMs,
  };

  await SecureStore.setItemAsync(key, JSON.stringify(payload));
}

async function getWithExpiry<T>(key: string): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(key);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredValue<T>;

    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    await SecureStore.deleteItemAsync(key);
    return null;
  }
}

export async function saveNeedToConnectedSocial(need: boolean) {
  await SecureStore.setItemAsync(
    NEED_TO_CONNECTED_SOCIAL_KEY,
    need ? 'true' : 'false'
  );
}

export async function getNeedToConnectedSocial(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(NEED_TO_CONNECTED_SOCIAL_KEY);
  return value === 'true';
}

export async function saveTwitterToken(twitterAccessToken: string) {
  await saveWithExpiry(TWITTER_ACCESS_TOKEN_KEY, twitterAccessToken);
}

export async function getTwitterToken(): Promise<string | null> {
  return await getWithExpiry<string>(TWITTER_ACCESS_TOKEN_KEY);
}

export async function saveTwitterUser(twitterUser: TwitterUser) {
  await saveWithExpiry<TwitterUser>(TWITTER_USER_KEY, twitterUser);
}

export async function getTwitterUser(): Promise<TwitterUser | null> {
  return await getWithExpiry<TwitterUser>(TWITTER_USER_KEY);
}

export async function getTwitterSession(): Promise<{
  twitterAccessToken: string;
  twitterUser: TwitterUser;
} | null> {
  const twitterAccessToken = await getWithExpiry<string>(
    TWITTER_ACCESS_TOKEN_KEY
  );

  const twitterUser = await getWithExpiry<TwitterUser>(TWITTER_USER_KEY);

  if (!twitterAccessToken || !twitterUser) {
    await deleteTwitterSession();
    return null;
  }

  return { twitterAccessToken, twitterUser };
}

export async function deleteTwitterSession() {
  await SecureStore.deleteItemAsync(TWITTER_ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(TWITTER_USER_KEY);
}

// Reddit

export async function saveRedditToken(redditAccessToken: string) {
  await saveWithExpiry(REDDIT_ACCESS_TOKEN_KEY, redditAccessToken);
}

export async function getRedditToken(): Promise<string | null> {
  return await getWithExpiry<string>(REDDIT_ACCESS_TOKEN_KEY);
}

export async function saveRedditUser(redditUser: RedditUser | string) {
  await saveWithExpiry<RedditUser | string>(REDDIT_USER_KEY, redditUser);
}

export async function getRedditUser(): Promise<RedditUser | string | null> {
  return await getWithExpiry<RedditUser | string>(REDDIT_USER_KEY);
}

export async function getRedditSession(): Promise<{
  redditAccessToken: string;
  redditUser: RedditUser | string;
} | null> {
  const redditAccessToken = await getWithExpiry<string>(
    REDDIT_ACCESS_TOKEN_KEY
  );

  const redditUser = await getWithExpiry<RedditUser | string>(REDDIT_USER_KEY);

  if (!redditAccessToken || !redditUser) {
    await deleteRedditSession();
    return null;
  }

  return { redditAccessToken, redditUser };
}

export async function deleteRedditSession() {
  await SecureStore.deleteItemAsync(REDDIT_ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REDDIT_USER_KEY);
}

// App user session

export async function saveUserSession(
  username: string,
  name: string,
  accessToken: string
) {
  await saveWithExpiry(USERNAME_KEY, username);
  await saveWithExpiry(NAME_KEY, name);
  await saveWithExpiry(ACCESS_TOKEN_KEY, accessToken);
}

export async function getUserSession(): Promise<{
  username: string;
  name: string;
  accessToken: string;
} | null> {
  const username = await getWithExpiry<string>(USERNAME_KEY);
  const name = await getWithExpiry<string>(NAME_KEY);
  const accessToken = await getWithExpiry<string>(ACCESS_TOKEN_KEY);

  if (!username || !name || !accessToken) {
    await deleteUserDetails();
    return null;
  }

  return { username, name, accessToken };
}

export async function deleteUserDetails() {
  await SecureStore.deleteItemAsync(USERNAME_KEY);
  await SecureStore.deleteItemAsync(NAME_KEY);
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

// Clear all

export async function clearAllSessions() {
  await deleteUserDetails();
  await deleteTwitterSession();
  await deleteRedditSession();
  await saveNeedToConnectedSocial(true);
}