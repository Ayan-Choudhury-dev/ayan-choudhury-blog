import React from 'react';
import { motion } from 'framer-motion';

interface MagicalSnippetProps {
  text: string;
}

export const MagicalSnippet: React.FC<MagicalSnippetProps> = ({ text }) => {
  const words = (text ?? '').trim().split(/\s+/).filter((w) => w.length > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      className="font-semibold font-serif text-lg leading-snug text-foreground max-w-2xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative">
        <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl rounded-full pointer-events-none -z-10" />
        <div className="flex flex-wrap gap-x-[0.3em] gap-y-1">
          {words.map((word, i) => (
            <motion.span
              key={`${i}-${word}`}
              variants={wordVariants}
              className="relative inline-block"
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
