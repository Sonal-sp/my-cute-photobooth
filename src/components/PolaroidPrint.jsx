import { AnimatePresence, motion } from 'framer-motion';

// Beautiful Polaroid print animation: photo slides out and develops
export default function PolaroidPrint({ print }) {
  return (
    <div className="polaroid-print-layer" aria-hidden="true">
      <AnimatePresence>
        {print && (
          <motion.div
            key={print.id}
            className="polaroid-print"
            initial={{ y: -80, opacity: 0, rotate: -6, scale: 0.7 }}
            animate={{ y: 40, opacity: 1, rotate: -2, scale: 1 }}
            exit={{ y: 200, opacity: 0, rotate: 4, scale: 0.9 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <div className="polaroid-develop">
              <img src={print.url} alt="Just printed" />
            </div>
            <div className="polaroid-caption">✨ cute! ✨</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
