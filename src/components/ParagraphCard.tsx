'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, AlertCircle } from 'lucide-react';
import { Paragraph } from '@/lib/data-utils';

interface ParagraphCardProps {
    paragraph: Paragraph;
    index: number;
    state: 'locked' | 'active' | 'completed';
    userSummary?: string;
    isRevealed?: boolean;
    onSubmit: (summary: string, role: string, pivots: string[]) => void;
    onReveal?: () => void;
    isEvaluating?: boolean;
    errorHint?: string;
}

export const ParagraphCard: React.FC<ParagraphCardProps> = ({
    paragraph,
    index,
    state,
    userSummary = '',
    isRevealed = false,
    onSubmit,
    onReveal,
    isEvaluating = false,
    errorHint = '',
}) => {
    const [summary, setSummary] = useState(userSummary);
    const [selectedRole, setSelectedRole] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedPivots, setSelectedPivots] = useState<string[]>([]);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (errorHint) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    }, [errorHint]);

    const handleSubmit = () => {
        if (summary.trim() && selectedRole) {
            onSubmit(summary, selectedRole, selectedPivots);
        }
    };

    const togglePivot = (word: string) => {
        setSelectedPivots(prev =>
            prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
        );
    };

    if (state === 'locked') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
                <div className="absolute inset-0 backdrop-blur-xl bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-center z-10">
                    <div className="text-center">
                        <Lock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-500">
                            Complete previous paragraph to unlock
                        </p>
                    </div>
                </div>
                <p className="text-lg leading-relaxed text-slate-700 dark:text-zinc-300 blur-sm select-none">
                    {paragraph.text}
                </p>
            </motion.div>
        );
    }

    if (state === 'completed') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border ${isRevealed ? 'border-amber-200 dark:border-amber-900' : 'border-green-200 dark:border-green-900'}`}
            >
                <div className="flex items-start gap-3 mb-4">
                    {isRevealed ? (
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                    ) : (
                        <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    )}
                    <div>
                        <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${isRevealed ? 'text-amber-600' : 'text-green-600'}`}>
                            Paragraph {index + 1} • {isRevealed ? 'Revealed' : 'Validated'}
                        </p>
                    </div>
                </div>
                <p className="text-lg leading-relaxed text-slate-500 dark:text-zinc-500 mb-6 opacity-60">
                    {paragraph.text}
                </p>
                <div className={`p-4 rounded-xl border-l-4 ${isRevealed ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500' : 'bg-slate-50 dark:bg-zinc-800/50 border-green-500'}`}>
                    <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
                        {isRevealed ? 'Expert Logic' : 'Your Logic Note'}
                    </p>
                    {isRevealed ? (
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">Role: {paragraph.role}</p>
                            <p className="text-sm text-slate-700 dark:text-zinc-300">{paragraph.summary}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-700 dark:text-zinc-300">{userSummary}</p>
                    )}
                </div>
            </motion.div>
        );
    }

    // Active state
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, x: shake ? [-10, 10, -10, 10, 0] : 0 }}
            transition={{ duration: shake ? 0.4 : 0.3 }}
            className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border-2 border-blue-500 dark:border-blue-600"
        >
            <div className="mb-6">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                    Paragraph {index + 1} • Active
                </p>
                <motion.p
                    animate={{ opacity: isFocused ? 0.05 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg leading-relaxed text-slate-700 dark:text-zinc-300"
                >
                    {paragraph.text.split(' ').map((word, i) => (
                        <span
                            key={i}
                            onClick={() => togglePivot(word)}
                            className={`inline-block cursor-pointer transition-colors ${selectedPivots.includes(word)
                                ? 'bg-yellow-200 dark:bg-yellow-900/40 px-1 rounded'
                                : 'hover:bg-slate-100 dark:hover:bg-zinc-800 px-1 rounded'
                                }`}
                        >
                            {word}{' '}
                        </span>
                    ))}
                </motion.p>
            </div>

            {/* Recall Blindfold Area */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                        Functional Role
                    </label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select role...</option>
                        <option value="Context">Context</option>
                        <option value="Background">Background</option>
                        <option value="Historical Viewpoint">Historical Viewpoint</option>
                        <option value="Current Strategy">Current Strategy</option>
                        <option value="Counter-point">Counter-point</option>
                        <option value="Alternative Hypothesis">Alternative Hypothesis</option>
                        <option value="Rebuttal">Rebuttal</option>
                        <option value="Evidence">Evidence</option>
                        <option value="Supporting Evidence">Supporting Evidence</option>
                        <option value="Supporting Detail">Supporting Detail</option>
                        <option value="Hypothesis">Hypothesis</option>
                        <option value="Limitation">Limitation</option>
                        <option value="Conclusion">Conclusion</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                        Summarize from memory
                    </label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="What is the main point? What role does it play?"
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                    {isFocused && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                            💡 The paragraph is now faded—recall from memory, don't copy!
                        </p>
                    )}
                </div>

                <AnimatePresence>
                    {errorHint && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                        >
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-200">{errorHint}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-3">
                    <button
                        onClick={handleSubmit}
                        disabled={!summary.trim() || !selectedRole || isEvaluating}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                        {isEvaluating ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Evaluating...
                            </span>
                        ) : (
                            'Unlock Next Paragraph'
                        )}
                    </button>

                    <button
                        onClick={onReveal}
                        className="w-full py-2 text-sm font-medium text-slate-500 hover:text-amber-600 dark:text-zinc-500 dark:hover:text-amber-500 transition-colors"
                    >
                        I&apos;m stuck - show solution
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
