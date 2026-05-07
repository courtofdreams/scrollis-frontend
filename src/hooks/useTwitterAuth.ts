// src/hooks/useTwitterAuth.ts
import { useCallback, useRef, useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as Random from "expo-random";
import * as Crypto from "expo-crypto";
import {
  TwitterSession,
  TwitterUser,
  useAppAuthContext,
} from "../contexts/AppAuthContext";
import { saveTwitterToken, saveTwitterUser } from "../utils/TokenManager";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID!;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
const REDIRECT_URI = process.env.EXPO_PUBLIC_TWITTER_REDIRECT_URI!;

type MeResponse = {
  data: TwitterUser;
  errors: any;
  includes: any;
};

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomUrlSafeString(length = 64) {
  const bytes = Random.getRandomBytes(length);
  return base64UrlEncode(bytes).slice(0, length);
}

async function sha256ToBase64Url(input: string) {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type ExchangeResponse = {
  access_token: string;
  twitter_user_info: MeResponse;
};

export function useTwitterAuth() {
  const {
    twitterAccessToken: accessToken,
    twitterUser: user,
    isTwitterAuthenticated,
    setTwitterAccessToken,
    clearTwitterAccessToken,
    setTwitterUser,
    clearTwitterUser,
    accessToken: appAccessToken,
  } =
    useAppAuthContext();
  const [loading, setLoading] = useState(false);
  const pkceRef = useRef<{ state: string; codeVerifier: string } | null>(null);

  // const fetchProfileData = async (accessToken: string) => {
  //   const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/twitter/me`;

  //   try {
  //     const response = await fetch(apiUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}`);
  //     }

  //     const profileData: MeResponse = await response.json();
  //     console.log("Fetched Twitter profile data:", profileData);

  //     setTwitterUser(profileData.data);
  //     saveTwitterUser(profileData.data);
  //     console.log("User session updated with Twitter profile data");

  //   } catch (err) {
  //     throw new Error(`Failed to fetch Twitter profile data: ${err instanceof Error ? err.message : String(err)}`);
  //   } finally {
  //   }
  // };

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      const state = randomUrlSafeString(32);
      const codeVerifier = randomUrlSafeString(64);
      const codeChallenge = await sha256ToBase64Url(codeVerifier);

      pkceRef.current = { state, codeVerifier };

      const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "tweet.read users.read offline.access",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      const authUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        REDIRECT_URI,
      );

      if (result.type !== "success" || !result.url) {
        throw new Error("Twitter login was cancelled or failed");
      }

      const callbackUrl = new URL(result.url);
      const code = callbackUrl.searchParams.get("code");
      const returnedState = callbackUrl.searchParams.get("state");

      if (!code || !returnedState) {
        throw new Error("Missing code or state from callback");
      }

      if (!pkceRef.current || returnedState !== pkceRef.current.state) {
        throw new Error("Invalid OAuth state");
      }

      const res = await fetch(`${API_BASE_URL}/api/twitter/auth/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${appAccessToken}` },
        body: JSON.stringify({
          code,
          code_verifier: pkceRef.current.codeVerifier,
          code_challenge_method: "S256",
          code_challenge: codeChallenge,
          callback_url: result.url,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Token exchange failed");
      }

      const data: ExchangeResponse = await res.json();
      setTwitterUser(data.twitter_user_info.data);

      setTwitterAccessToken(data.access_token);
      saveTwitterToken(data.access_token);

      return data;
    } finally {
      setLoading(false);
    }
  }, [setTwitterAccessToken]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/twitter/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${appAccessToken}` },
        credentials: "include",
      });

      if (!res.ok) {
        clearTwitterAccessToken();
        throw new Error("Refresh failed");
      }

      const data: ExchangeResponse = await res.json();

      setTwitterAccessToken(data.access_token);
      setTwitterUser(data.twitter_user_info.data);

      return data;
    } finally {
      setLoading(false);
    }
  }, [setTwitterAccessToken, clearTwitterAccessToken]);

  const signOut = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/twitter/logout`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${appAccessToken}` },
        credentials: "include",
      });
    } catch {
      console.warn("Failed to notify backend about logout");
    }
    clearTwitterAccessToken();
  }, [clearTwitterAccessToken]);

  return {
    accessToken,
    user,
    isTwitterAuthenticated,
    loading,
    signIn,
    refresh,
    signOut,
  };
}
