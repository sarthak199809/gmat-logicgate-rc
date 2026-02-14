import { useState, useEffect } from 'react';
import { Passage, Paragraph } from '@/lib/data-utils';

export type UserInput = {
    paragraphIndex: number;
    userSummary: string;
    roleSelected: string;
    pivots: string[];
    isValidated: boolean;
    isRevealed?: boolean;
};

export function usePassageState() {
    const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
    const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
    const [completionStatus, setCompletionStatus] = useState<UserInput[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const savedPassage = localStorage.getItem('currentPassage');
        const savedIndex = localStorage.getItem('activeParagraphIndex');
        const savedStatus = localStorage.getItem('completionStatus');

        if (savedPassage) setCurrentPassage(JSON.parse(savedPassage));
        if (savedIndex) setActiveParagraphIndex(parseInt(savedIndex, 10));
        if (savedStatus) setCompletionStatus(JSON.parse(savedStatus));

        setIsLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (isLoaded) {
            if (currentPassage) localStorage.setItem('currentPassage', JSON.stringify(currentPassage));
            localStorage.setItem('activeParagraphIndex', activeParagraphIndex.toString());
            localStorage.setItem('completionStatus', JSON.stringify(completionStatus));
        }
    }, [currentPassage, activeParagraphIndex, completionStatus, isLoaded]);

    const selectPassage = async (passage: Passage) => {
        setIsAnalyzing(true);
        setCurrentPassage(null); // Clear while loading

        try {
            const response = await fetch('api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullText: passage.fullText }),
            });

            const data = await response.json();

            if (data.paragraphs) {
                setCurrentPassage({
                    ...passage,
                    paragraphs: data.paragraphs
                });
                setActiveParagraphIndex(0);
                setCompletionStatus([]);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const updateParagraphStatus = (index: number, data: Partial<UserInput>) => {
        setCompletionStatus((prev) => {
            const existing = prev.find((s) => s.paragraphIndex === index);
            if (existing) {
                return prev.map((s) => s.paragraphIndex === index ? { ...s, ...data } : s);
            }
            return [...prev, { paragraphIndex: index, userSummary: '', roleSelected: '', pivots: [], isValidated: false, ...data } as UserInput];
        });
    };

    const unlockNext = () => {
        if (currentPassage && currentPassage.paragraphs && activeParagraphIndex < currentPassage.paragraphs.length) {
            setActiveParagraphIndex((prev) => prev + 1);
        }
    };

    const reset = () => {
        setCurrentPassage(null);
        setActiveParagraphIndex(0);
        setCompletionStatus([]);
        localStorage.removeItem('currentPassage');
        localStorage.removeItem('activeParagraphIndex');
        localStorage.removeItem('completionStatus');
    };

    return {
        currentPassage,
        activeParagraphIndex,
        completionStatus,
        isLoaded,
        isAnalyzing,
        selectPassage,
        updateParagraphStatus,
        unlockNext,
        reset,
    };
}
