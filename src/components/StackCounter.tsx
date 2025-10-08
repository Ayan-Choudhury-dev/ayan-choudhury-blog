import { useEffect, useState } from "react";

interface StackCounterProps {
  currentCard: number;
  totalCards: number;
}

export default function StackCounter({ currentCard, totalCards }: StackCounterProps) {
  return (
    <div className="inline-flex items-center justify-center px-3 py-1 text-sm rounded-full bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 backdrop-blur-sm">
      <span>{totalCards-currentCard+1}</span>
      <span className="mx-1">/</span>
      <span>{totalCards}</span>
    </div>
  );
} 