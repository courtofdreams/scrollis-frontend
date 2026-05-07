import { useCallback, useState } from "react";
import { useAppAuthContext } from "../contexts/AppAuthContext";
import * as WebBrowser from "expo-web-browser";
import { useDeepLink } from "./useRedditAuthListener";
import * as Linking from "expo-linking";
import {
  saveRedditToken,
  saveRedditUser,
} from "../utils/TokenManager";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
WebBrowser.maybeCompleteAuthSession();

const stringToNumber = (value: string | number | undefined, defaultValue: number): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

export function useRedditAuth() {
  const {
    redditAccessToken,
    setRedditAccessToken,
    setRedditUser,
    accessToken: appAccessToken,
  } = useAppAuthContext();
  const [loading, setLoading] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  const onReceive = useCallback(
    async (url: string) => {

      const parsed = Linking.parse(url);

      const isRedditCallback =
        parsed.path === "reddit-callback" ||
        parsed.hostname === "reddit-callback";

      if (isRedditCallback) {
        const code = parsed.queryParams?.access_token;
        const refresh_token = parsed.queryParams?.refresh_token;
        const expires_in = parsed.queryParams?.expires_in || 3600;

        console.log("Received Reddit callback with code:", code);
        console.log("Received Reddit callback with refresh_token:", refresh_token);
        console.log("Received Reddit callback with expires_in:", expires_in);

        setRedditAccessToken(code as string);
        saveRedditToken(code as string);
        setExpiresIn(stringToNumber(expires_in as string, 3600));
        setRefreshToken(refresh_token as string);
        setLoading(false);
        await WebBrowser.dismissBrowser();
      }
    },
    [setRedditAccessToken, setRedditUser, setExpiresIn, setRefreshToken],
  );

  const getMe = async (accessToken: string) => {
    if (!refreshToken || expiresIn === null) {
      throw new Error("Missing Reddit session metadata")
    }

    console.log("Fetching Reddit user info with access token:", accessToken);
    console.log("Fetching Reddit user info with refresh token:", refreshToken);
    console.log("Fetching Reddit user info with expires_in:", expiresIn);

    try {

      const res = await fetch(`${API_BASE_URL}/api/reddit/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${appAccessToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          reddit_access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn,
        }),
      });

      const redditUser = await res.json();
      setRedditUser(redditUser);
      saveRedditUser(redditUser.username);
    } catch (err) {
      console.error(
        "Error fetching Reddit user info:",
        err instanceof Error ? err.message : String(err),
      );
      console.error("Failed to fetch Reddit user info:", err);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reddit/auth/exchange`);
      const { auth_url } = await res.json();

      // Opens Reddit login in a browser; Reddit will redirect to our backend,
      // which deep-links back to the app with tokens.
      const result = await WebBrowser.openBrowserAsync(auth_url);

      if (result.type === "cancel") {
        setLoading(false);
        throw new Error("cancel");
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  useDeepLink(onReceive);

  return { signIn, loading, isRedditAuthenticated: !!redditAccessToken, getMe, expiresIn, refreshToken };
}
