'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const difficulties = [
    { name: 'Very Easy', color: 'from-green-400 to-green-600', hoverColor: 'hover:shadow-green-500/50' },
    { name: 'Easy', color: 'from-lime-400 to-lime-600', hoverColor: 'hover:shadow-lime-500/50' },
    { name: 'Medium', color: 'from-yellow-400 to-yellow-600', hoverColor: 'hover:shadow-yellow-500/50' },
    { name: 'Medium-Hard', color: 'from-orange-400 to-orange-600', hoverColor: 'hover:shadow-orange-500/50' },
    { name: 'Hard', color: 'from-red-400 to-red-600', hoverColor: 'hover:shadow-red-500/50' },
];

interface DifficultySelectorProps {
    onSelect: (difficulty: string) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 p-6">
            {difficulties.map((diff, index) => (
                <motion.button
                    key={diff.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(diff.name)}
                    className={cn(
                        "relative group overflow-hidden rounded-2xl p-8 text-white shadow-lg transition-all duration-300",
                        "bg-gradient-to-br",
                        diff.color,
                        diff.hoverColor,
                        "hover:-translate-y-2 hover:shadow-2xl active:scale-95"
                    )}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-xl font-bold mb-2">{diff.name}</h3>
                    <p className="text-sm text-white/80">
                        {index === 0 ? 'Start here for basics' :
                            index === 4 ? 'The ultimate challenge' :
                                'Test your active synthesis'}
                    </p>
                </motion.button>
            ))}
        </div>
    );
};
