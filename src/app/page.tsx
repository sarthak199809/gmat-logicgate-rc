'use client';

import { useState, useEffect } from 'react';
import { fetchPassages, Passage, getRandomPassageByDifficulty } from '@/lib/data-utils';
import { DifficultySelector } from '@/components/DifficultySelector';
import { ParagraphCard } from '@/components/ParagraphCard';
import { usePassageState } from '@/hooks/usePassageState';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Loader2 } from 'lucide-react';

export default function Home() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorHint, setErrorHint] = useState('');
  const [masteryStreak, setMasteryStreak] = useState(0);

  const {
    currentPassage,
    activeParagraphIndex,
    completionStatus,
    isAnalyzing,
    selectPassage,
    updateParagraphStatus,
    unlockNext,
    reset
  } = usePassageState();

  useEffect(() => {
    fetchPassages().then(setPassages);
  }, []);

  const handleDifficultySelect = async (difficulty: string) => {
    const passage = getRandomPassageByDifficulty(passages, difficulty as any);
    if (passage) {
      await selectPassage(passage);
      setMasteryStreak(0);
    }
  };

  const handleParagraphSubmit = async (index: number, summary: string, role: string, pivots: string[]) => {
    if (!currentPassage || !currentPassage.paragraphs) return;

    setIsEvaluating(true);
    setErrorHint('');

    const expertParagraph = currentPassage.paragraphs[index];

    try {
      const response = await fetch('/gmatrcMVP/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_summary: summary,
          expert_summary: expertParagraph.summary,
          role_selected: role,
          expert_role: expertParagraph.role,
        }),
      });

      const result = await response.json();

      if (result.isValid) {
        updateParagraphStatus(index, {
          paragraphIndex: index,
          userSummary: summary,
          roleSelected: role,
          pivots,
          isValidated: true,
        });
        unlockNext();
        setMasteryStreak(prev => prev + 1);
      } else {
        setErrorHint(result.hint || 'Try again. Capture the key idea and ensure the role is correct.');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      setErrorHint('Something went wrong. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleParagraphReveal = (index: number) => {
    if (!currentPassage || !currentPassage.paragraphs) return;
    const expertParagraph = currentPassage.paragraphs[index];

    updateParagraphStatus(index, {
      paragraphIndex: index,
      userSummary: expertParagraph.summary,
      roleSelected: expertParagraph.role,
      pivots: expertParagraph.pivots,
      isValidated: true,
      isRevealed: true,
    });
    unlockNext();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-500">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 dark:bg-zinc-800 z-50">
        <motion.div
          className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
          initial={{ width: 0 }}
          animate={{
            width: (currentPassage && currentPassage.paragraphs)
              ? `${((activeParagraphIndex + 1) / currentPassage.paragraphs.length) * 100}%`
              : 0
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!currentPassage && !isAnalyzing ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-4 py-20"
          >
            <div className="text-center mb-16">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                GMAT LogicGate RC
              </motion.h1>
              <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Train your active synthesis. Summarize each paragraph to unlock the next.
                No multiple choice, just pure structural logic.
              </p>
            </div>

            <DifficultySelector onSelect={handleDifficultySelect} />
          </motion.div>
        ) : isAnalyzing ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 z-[100]"
          >
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Analyzing Passage Structure</h2>
            <p className="text-slate-500 dark:text-zinc-400">AI is identifying structural roles and paragraph splits...</p>
          </motion.div>
        ) : currentPassage && currentPassage.paragraphs ? (
          <motion.div
            key="reading-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8"
          >
            {/* Main Reading Area */}
            <div className="flex-1 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">{currentPassage.title}</h2>
                  <span className="text-sm font-medium px-2 py-1 bg-slate-200 dark:bg-zinc-800 rounded uppercase tracking-wider">
                    {currentPassage.difficulty}
                  </span>
                </div>
                <button
                  onClick={reset}
                  className="text-sm text-slate-500 hover:text-red-500 transition-colors"
                >
                  Change Passage
                </button>
              </div>

              <div className="space-y-8">
                {currentPassage.paragraphs.map((para, index) => {
                  const userInput = completionStatus.find(s => s.paragraphIndex === index);
                  const state =
                    index < activeParagraphIndex ? 'completed' :
                      index === activeParagraphIndex ? 'active' :
                        'locked';

                  return (
                    <ParagraphCard
                      key={index}
                      paragraph={para}
                      index={index}
                      state={state}
                      userSummary={userInput?.userSummary}
                      isRevealed={userInput?.isRevealed}
                      onSubmit={(summary, role, pivots) => handleParagraphSubmit(index, summary, role, pivots)}
                      onReveal={() => handleParagraphReveal(index)}
                      isEvaluating={isEvaluating && index === activeParagraphIndex}
                      errorHint={index === activeParagraphIndex ? errorHint : ''}
                    />
                  );
                })}
              </div>

              {/* Completion Badge */}
              {activeParagraphIndex >= currentPassage.paragraphs.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-12 p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-500 text-center"
                >
                  <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-300 mb-2">
                    Passage Conquered!
                  </h3>
                  <p className="text-green-700 dark:text-green-400 mb-6">
                    You&apos;ve mastered the structural logic of this passage.
                  </p>
                  {currentPassage.difficulty === 'Hard' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                        Anti-Elimination Badge Earned
                      </span>
                    </div>
                  )}
                  <button
                    onClick={reset}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Another Passage
                  </button>
                </motion.div>
              )}
            </div>

            {/* Sidebar Logic Map */}
            <aside className="w-full lg:w-64 space-y-4">
              {/* Mastery Streak */}
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-yellow-800 dark:text-yellow-200">
                    Mastery Streak
                  </h3>
                </div>
                <p className="text-3xl font-black text-yellow-700 dark:text-yellow-300">
                  {masteryStreak}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  First-try unlocks
                </p>
              </div>

              {/* Logic Map */}
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 sticky top-8">
                <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Logic Map</h3>
                <div className="space-y-3">
                  {currentPassage.paragraphs.map((para, i) => {
                    const userInput = completionStatus.find(s => s.paragraphIndex === i);
                    const isCompleted = i < activeParagraphIndex;

                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isCompleted ? 'bg-blue-600' :
                          i === activeParagraphIndex ? 'bg-blue-400 animate-pulse' :
                            'bg-slate-200 dark:bg-zinc-800'
                          }`} />
                        <div className="flex-1 min-w-0">
                          {isCompleted && userInput ? (
                            <div>
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                {userInput.roleSelected}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                                {userInput.userSummary}
                              </p>
                            </div>
                          ) : i === activeParagraphIndex ? (
                            <p className="text-xs text-slate-500 italic">In progress...</p>
                          ) : (
                            <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
