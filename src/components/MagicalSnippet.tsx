import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextEffect } from '@/components/motion-primitives/text-effect';

interface MagicalSnippetProps {
  texts: string[];
}

type SnippetType = 'quote' | 'normal';

interface ParsedSnippet {
  type: SnippetType;
  content: string;
}

export const MagicalSnippet: React.FC<MagicalSnippetProps> = ({ texts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * texts.length);
    setCurrentIndex(randomIdx);
  }, [texts]);

  const rawText = texts[currentIndex] ?? '';

  const parsed = useMemo((): ParsedSnippet => {
    const trimmed = rawText.trim();
    if (trimmed.startsWith('>')) {
      // It's a quote
      let content = trimmed.substring(1).trim();
      // Handle legacy markdown formatting like >*Text*
      content = content.replace(/^\*+\s*(.*?)\s*\*+$/, '$1');
      return { type: 'quote', content };
    }
    return { type: 'normal', content: trimmed };
  }, [rawText]);

  return (
    <div className="relative group min-h-[5rem] flex items-center py-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className={`relative max-w-2xl pl-10 border-l-2 transition-colors duration-500 ${
            parsed.type === 'quote'
              ? 'border-accent-color/40 sm:border-accent-color/30 italic'
              : 'border-transparent'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {parsed.type === 'quote' && (
            <span className="absolute -left-3 -top-6 text-6xl font-serif text-accent-color/10 pointer-events-none select-none">
              &ldquo;
            </span>
          )}

          <div className="absolute -inset-16 bg-gradient-to-tr from-accent-color/10 via-transparent to-accent-color/5 blur-3xl rounded-full pointer-events-none -z-10 opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />

          <TextEffect
            per="word"
            as="h1"
            preset="blur"
            speedReveal={2}
            className={`font-serif text-lg sm:text-xl tracking-tight leading-snug ${
              parsed.type === 'quote'
                ? 'text-foreground font-normal'
                : 'text-foreground/85 font-medium'
            }`}
          >
            {parsed.content}
          </TextEffect>

          {parsed.type === 'quote' && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              className="mt-6 h-px bg-accent-color/20"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
