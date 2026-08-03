import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export const THEMES = [
  { id: 'default', name: '🌷 Default', primary: '#ffb6c1', light: '#ffd6e0' },
  { id: 'cherry', name: '🌸 Cherry Blossom', primary: '#ffb7c5', light: '#ffe4ea' },
  { id: 'strawberry', name: '🍓 Strawberry Milk', primary: '#ff8fab', light: '#ffd9e2' },
  { id: 'cotton', name: '🍬 Cotton Candy', primary: '#c9b6ff', light: '#e9e2ff' },
  { id: 'galaxy', name: '🌌 Galaxy Dream', primary: '#9b8cff', light: '#ded9ff' },
  { id: 'teddy', name: '🧸 Teddy Bear', primary: '#d9a588', light: '#f4e1d5' },
  { id: 'matcha', name: '🍵 Matcha Latte', primary: '#a8d5a2', light: '#e0f2dd' },
  { id: 'kuromi', name: '💜 Kuromi', primary: '#8b7ad8', light: '#e2dcf7' },
  { id: 'cinna', name: '☁️ Cinnamoroll', primary: '#7fc8e8', light: '#dff2fb' },
];

// Theme pack switcher
export default function ThemeSwitcher({ currentTheme, onSelect, onClose }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="theme-switcher">
      <button
        className="theme-toggle-btn"
        onClick={() => setOpen((v) => !v)}
        title="Theme packs"
      >
        🎨 <span>Theme</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="theme-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="theme-panel-title">💖 Pick a Theme Pack</div>
            <div className="theme-grid">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-chip ${currentTheme === t.id ? 'selected' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${t.light}, ${t.primary})` }}
                  onClick={() => {
                    onSelect(t);
                    setOpen(false);
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
