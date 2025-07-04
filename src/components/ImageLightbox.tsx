'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  title: string;
}

const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev, title }: ImageLightboxProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onNext();
      }
      if (e.key === 'ArrowLeft') {
        onPrev();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrev, onClose]);

  const currentImage = images[currentIndex];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="relative w-full h-full max-w-4xl max-h-4xl p-4" onClick={(e) => e.stopPropagation()}>
          <motion.div
            key={currentImage} // Key for re-animating image on change
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center"
          >
            <Image
              src={currentImage}
              alt={title}
              layout="fill"
              objectFit="contain"
              className="rounded-lg shadow-lg"
            />
          </motion.div>
          {images.length > 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full text-2xl hover:bg-black/70 transition-colors"
              >
                &#10094;
              </button>
              <button
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full text-2xl hover:bg-black/70 transition-colors"
              >
                &#10095;
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full text-2xl hover:bg-black/70 transition-colors"
          >
            &times;
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body // Render into the document body
  );
};

export default ImageLightbox;
