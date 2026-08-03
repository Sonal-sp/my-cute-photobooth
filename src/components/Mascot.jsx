import { useState, useEffect } from 'react';

const MASCOT_FACES = ['🐱', '🐰', '🐻', '🐤', '🐶', '🐼'];
const REACTIONS = ['😊', '🥰', '😍', '😝', '🎀'];

// Cute mascot in the bottom-right corner that waves, blinks, and reacts
export default function Mascot() {
  const [face] = useState(() => MASCOT_FACES[Math.floor(Math.random() * MASCOT_FACES.length)]);
  const [mood, setMood] = useState('wave');
  const [reaction, setReaction] = useState(null);

  useEffect(() => {
    // Periodic wave & blink cycle
    const cycle = setInterval(() => {
      setMood('wave');
      setTimeout(() => setMood('blink'), 700);
      setTimeout(() => setMood('idle'), 1100);
    }, 6000);

    // React to user clicks anywhere
    const onClick = () => {
      setReaction(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
      setTimeout(() => setReaction(null), 1800);
    };
    window.addEventListener('click', onClick);

    return () => {
      clearInterval(cycle);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className={`mascot mascot-${mood}`} title="I'm your photo buddy! 💕">
      <div className="mascot-bubble">{mood === 'wave' ? 'Hi! 👋' : reaction || '💕'}</div>
      <div className="mascot-body">
        <span className="mascot-face">{face}</span>
        <span className="mascot-paw left-paw">🫲</span>
        <span className="mascot-paw right-paw">🫱</span>
      </div>
    </div>
  );
}
