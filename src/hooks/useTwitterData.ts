// src/hooks/useTweets.ts
import { useCallback, useEffect, useState } from "react";
import { parseTweetsResponse } from "../utils/TweetParser";
import { PostCardModel } from "../screens/TopicDetailScreen";
import { useAppAuthContext } from "../contexts/AppAuthContext";

type UseTwitterDataResult = {
  fetchGetTimeline: () => Promise<PostCardModel[]>;
};

export function useTwitterData(): UseTwitterDataResult {
  const { accessToken, user, isAuthenticated } = useAppAuthContext();

  const fetchGetTimeline = async (): Promise<PostCardModel[]> => {
    if (!isAuthenticated || !user) {
      throw new Error("User is not authenticated");
    }

    const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/twitter/search/tweets/user_timeline/${user?.id}`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      return parseTweetsResponse(json);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch tweets",
      );
    } finally {
      // setLoading(false);
    }
  };

  return {
    fetchGetTimeline,
  };
}
