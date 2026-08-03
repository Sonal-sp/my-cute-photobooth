import { useMemo } from 'react';

// Dreamy floating background elements: sparkles, hearts, bows, clouds, flowers, bubbles, stars
const ELEMENTS = [
  { type: '✨', label: 'sparkle' },
  { type: '💖', label: 'heart' },
  { type: '🎀', label: 'bow' },
  { type: '☁️', label: 'cloud' },
  { type: '🌸', label: 'flower' },
  { type: '🫧', label: 'bubble' },
  { type: '⭐', label: 'star' },
  { type: '🌷', label: 'tulip' },
  { type: '🦋', label: 'butterfly' },
];

export default function FloatingBackground() {
  const items = useMemo(() => {
    return Array.from({ length: 26 }).map((_, i) => {
      const el = ELEMENTS[i % ELEMENTS.length];
      return {
        id: i,
        emoji: el.type,
        label: el.label,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 14 + Math.random() * 26,
        duration: 12 + Math.random() * 18,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 60,
        opacity: 0.1 + Math.random() * 0.1,
      };
    });
  }, []);

  return (
    <div className="floating-bg" aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.id}
          className={`floaty float-${it.label}`}
          style={{
            left: `${it.left}%`,
            top: `${it.top}%`,
            fontSize: `${it.size}px`,
            opacity: it.opacity,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
            '--drift': `${it.drift}px`,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}
