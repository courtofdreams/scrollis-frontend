import { useAnalysisResult } from "../contexts/AnalysisContext";
import { useAppAuthContext } from "../contexts/AppAuthContext";
import { DifferentPerspectiveRequest, DifferentPerspectiveResponse, HistoricalTopicsResponse, TopicDigestResponse } from "../models/Analysis";

export function useAnalysis() {
    const { accessToken } = useAppAuthContext();
    const { setAnalysis, setDifferentPerspectives, differentPerspectives } = useAnalysisResult();

    const fetchDifferentPerspectives = async (requestBody: DifferentPerspectiveRequest): Promise<DifferentPerspectiveResponse> => {
        console.log('Fetching different perspectives with request body:', requestBody)
        const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/analyze/different-perspectives`
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Received response for different perspectives:', response)

            if (!response.ok) {
                throw new Error('Failed to fetch different perspectives data');
            }

            const data = await response.json();

            // map API response (singular) to the context shape and append
            // API returns: { topic_id, wandering, uncharted }
            const mapped = {
                topic_id: requestBody.topic_id,
                wandering: data.wandering,
                // map 'uncharted' from API to the context's 'unchanged' key
                unchanged: data.uncharted,
            };

            const existing = differentPerspectives || [];
            setDifferentPerspectives([...
                existing,
                mapped,
            ]);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const fetchAnalysis = async (): Promise<TopicDigestResponse> => {
        const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/analyze/topics`
        
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analysis data');
            }

            const data = await response.json();
            setAnalysis(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const fetchHistoricalTopics = async (): Promise<HistoricalTopicsResponse> => {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/analyze/historical-topics`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch historical topics data");
      }

      return await response.json();
    };

    return { fetchAnalysis, fetchDifferentPerspectives, fetchHistoricalTopics };
}