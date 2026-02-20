import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import StackCounter from "./StackCounter";

// Props interface for the CardRotate component
interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}

/**
 * CardRotate Component
 * Handles the 3D rotation effect of individual cards based on drag interactions
 * Uses Framer Motion for smooth animations and transformations
 */
function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  // Motion values for tracking x and y positions during drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform drag values into rotation angles for 3D effect
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  // Handle drag end event - determines if card should be sent to back
  function handleDragEnd(_: never, info: { offset: { x: number; y: number } }) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      // Reset position if drag distance is below sensitivity threshold
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

// Props interface for the main Stack component
interface StackProps {
  randomRotation?: boolean;  // Enable random rotation for cards
  sensitivity?: number;      // Drag sensitivity threshold
  cardDimensions?: { width: number; height: number };  // Card size
  sendToBackOnClick?: boolean;  // Enable sending card to back on click
  cardsData?: { id: number; img: string; track?: string; artist?: string; url?: string; date?: Date }[];  // Card data
  animationConfig?: { stiffness: number; damping: number };  // Animation spring configuration
}

/**
 * Stack Component
 * Creates a stack of cards with 3D effects and interactive animations
 * Supports drag interactions, card rotation, and optional click behavior
 */
export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cardDimensions = { width: 208, height: 208 },
  cardsData = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
}: StackProps) {
  // Initialize cards state with provided data
  const [cards, setCards] = useState(cardsData);
  // Check if this is first load to prevent animation FOUC
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.hasAttribute('data-first-load');
    }
    return false;
  });

  // Remove first-load flag after component mounts
  useEffect(() => {
    if (isFirstLoad) {
      // Wait a frame to ensure initial render is complete
      requestAnimationFrame(() => {
        setIsFirstLoad(false);
      });
    }
  }, [isFirstLoad]);

  // Function to move a card to the back of the stack
  const sendToBack = (id: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  };

  // Calculate the index of the top card (last in the array) in the original cardsData
  const topCard = cards[cards.length - 1];
  const topCardIndex = topCard ? cardsData.findIndex(card => card.id === topCard.id) + 1 : 0;

  return (
    <>
      <div
        className="relative mx-auto"
        style={{
          width: cardDimensions.width,
          height: cardDimensions.height,
          perspective: 600,  // 3D perspective for the stack
        }}
      >
        {cards.map((card, index) => {
          // Calculate random rotation if enabled
          const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;

          return (
            <CardRotate
              key={card.id}
              onSendToBack={() => sendToBack(card.id)}
              sensitivity={sensitivity}
            >
              <motion.div
                className="rounded-2xl overflow-hidden border-4 border-white "
                onClick={() => {
                  if (sendToBackOnClick) {
                    sendToBack(card.id);
                  }
                  if (card.url) {
                    window.open(card.url, "_blank");
                  }
                }}
                // Animate card position and rotation
                animate={{
                  rotateZ: (cards.length - index - 1) * 3 + randomRotate,
                  scale: 1 + index * 0.06 - cards.length * 0.06,
                  transformOrigin: "90% 90%",
                }}
                initial={false}
                transition={
                  isFirstLoad
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: animationConfig.stiffness,
                        damping: animationConfig.damping,
                        bounce: 20,
                      }
                }
                style={{
                  width: cardDimensions.width,
                  height: cardDimensions.height,
                }}
              >
                {/* Card Image */}
                <img
                  src={card.img}
                  alt={card.track || `card-${card.id}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
                {/* Card Info Overlay (for music/video cards) */}
                {(card.track || card.artist) && (
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/95 blur-sm" />
                    <div className="relative text-white flex items-end justify-between">
                      <div>
                        {card.track && <div className="font-bold text-lg truncate">{card.track}</div>}
                        {card.artist && <div className="text-sm opacity-80">{card.artist}</div>}
                        {card.date && (
                          <div className="text-xs opacity-60 mt-1">
                            {new Date(card.date).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "long"
                            })}
                          </div>
                        )}
                      </div>
                      {/* Play Button (for music/video cards) */}
                      {card.url && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(card.url, "_blank");
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {/* Spotify or YouTube icon based on URL */}
                          {card.url.includes("spotify.com") ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="flex-shrink-0"
                            >
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="flex-shrink-0"
                            >
                              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                          )}
                          <span className="text-xs">Play</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </CardRotate>
          );
        })}
      </div>
      <div className="flex justify-center mt-8">
        <StackCounter currentCard={topCardIndex} totalCards={cardsData.length} />
      </div>
    </>
  );
}

