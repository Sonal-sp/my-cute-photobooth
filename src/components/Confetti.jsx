import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PARTICLES = ['🎉', '💖', '✨', '🌸', '⭐', '🎀', '💕', '🫧'];

// Soft confetti / hearts / sparkles celebration after capturing
export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    const newPieces = Array.from({ length: 40 }).map((_, i) => ({
      id: `${trigger}-${i}`,
      emoji: PARTICLES[Math.floor(Math.random() * PARTICLES.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.6 + Math.random() * 1.4,
      size: 16 + Math.random() * 22,
      drift: (Math.random() - 0.5) * 160,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 3200);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="confetti-layer" aria-hidden="true">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className="confetti-piece"
            style={{ left: `${p.left}%`, fontSize: `${p.size}px` }}
            initial={{ y: -40, opacity: 1 }}
            animate={{ y: window.innerHeight * 0.9 + 120, opacity: 0, x: p.drift }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
