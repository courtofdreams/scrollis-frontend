import React, { createContext, useContext, useState } from 'react';
import { Topic, TopicDigestResponse } from '../models/Analysis';

type DifferentPerspective = {
  topic_id: number;
  wandering: Topic;
  unchanged: Topic;
}


type AnalysisContextType = {
	analysis: TopicDigestResponse | null;
	differentPerspectives: DifferentPerspective[] | null;
	setAnalysis: (data: TopicDigestResponse) => void;
	setDifferentPerspectives: (data: DifferentPerspective[]) => void;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
	const [analysis, setAnalysis] = useState<TopicDigestResponse | null>(null);
	const [differentPerspectives, setDifferentPerspectives] = useState<DifferentPerspective[] | null>(null);

	return (
		<AnalysisContext.Provider value={{ analysis, setAnalysis, differentPerspectives, setDifferentPerspectives }}>
			{children}
		</AnalysisContext.Provider>
	);
}

export function useAnalysisResult() {
	const context = useContext(AnalysisContext);

	if (!context) {
		throw new Error('useAnalysisResult must be used inside AnalysisProvider');
	}

	return context;
}