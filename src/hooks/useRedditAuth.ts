import { useCallback, useState } from "react";
import { useAppAuthContext } from "../contexts/AppAuthContext";
import * as WebBrowser from "expo-web-browser";
import { useDeepLink } from "./useRedditAuthListener";
import * as Linking from 'expo-linking';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
WebBrowser.maybeCompleteAuthSession();


export function useRedditAuth() {
    const { redditAccessToken, setRedditAccessToken, redditUser, setRedditUser } = useAppAuthContext()  
    const [loading, setLoading] = useState(false);
    

    const onReceive = useCallback(async (url: string) => {
    console.log('URL received:', url);

    const parsed = Linking.parse(url);

    const isRedditCallback =
      parsed.path === 'reddit-callback' ||
      parsed.hostname === 'reddit-callback';

    if (isRedditCallback) {
      const code = parsed.queryParams?.access_token;
      const refresh_token = parsed.queryParams?.refresh_token;
      const expires_in = parsed.queryParams?.expires_in || 3600;

      console.log('Reddit code:', code);
      setRedditAccessToken(code as string);
      setLoading(false);
      await WebBrowser.dismissBrowser();
    }
  }, [setRedditAccessToken, setRedditUser]);


  const signIn = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reddit/auth/exchange`);
      const { auth_url } = await res.json();

      // Opens Reddit login in a browser; Reddit will redirect to our backend,
      // which deep-links back to the app with tokens.
      const result = await WebBrowser.openBrowserAsync(auth_url);
      console.log("WebBrowser result:", result);

    } catch (err) {
      console.error("Login failed:", err);
    }

  };

  useDeepLink(onReceive);

  return { signIn, loading, isRedditAuthenticated: !!redditAccessToken };
}