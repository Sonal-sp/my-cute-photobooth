import { AnimatePresence, motion } from 'framer-motion';

const ICONS = {
  success: '🌸',
  error: '💔',
  info: '💌',
  sparkle: '✨',
};

// Floating cute toast notifications
export default function Toasts({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast toast-${t.type || 'info'}`}
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => onDismiss(t.id)}
          >
            <span className="toast-icon">{ICONS[t.type] || '💌'}</span>
            <span className="toast-msg">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
