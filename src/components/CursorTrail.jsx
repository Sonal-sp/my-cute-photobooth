import { useEffect, useRef } from 'react';

const TRAIL_EMOJIS = ['✨', '💖', '⭐', '🌸', '🫧', '💕', '🎀'];

// Cursor sparkle trail that follows the mouse smoothly
export default function CursorTrail() {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch devices

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const interval = setInterval(() => {
      const m = mouseRef.current;
      const last = lastRef.current;
      const dist = Math.hypot(m.x - last.x, m.y - last.y);
      if (dist < 30) return;
      lastRef.current = { x: m.x, y: m.y };

      const emoji = TRAIL_EMOJIS[Math.floor(Math.random() * TRAIL_EMOJIS.length)];
      const p = document.createElement('span');
      p.className = 'cursor-particle';
      p.textContent = emoji;
      p.style.left = `${m.x}px`;
      p.style.top = `${m.y}px`;
      p.style.fontSize = `${10 + Math.random() * 12}px`;
      container.appendChild(p);
      particlesRef.current.push(p);
      setTimeout(() => {
        p.remove();
        particlesRef.current = particlesRef.current.filter((x) => x !== p);
      }, 900);
    }, 90);

    window.addEventListener('mousemove', onMove);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <div ref={containerRef} className="cursor-trail" aria-hidden="true" />;
}
