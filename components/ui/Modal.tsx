'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Find the actual scrollable container
    const scrollContainer = document.getElementById('main-scroll') || document.body;
    const originalOverflow = scrollContainer.style.overflow;
    scrollContainer.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      // Only restore scroll overflow if there are no other open modals
      const activeModals = document.querySelectorAll('[data-modal-active="true"]');
      if (activeModals.length <= 1) {
        scrollContainer.style.overflow = originalOverflow || '';
      }
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          data-modal-active="true"
        >
          {/* Backdrop with fade transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Panel with scale + fade spring-like transition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-lg z-10 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-4 select-text"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors outline-none cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="text-sm text-white/80 leading-relaxed py-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
