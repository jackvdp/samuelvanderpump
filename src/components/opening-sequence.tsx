"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function OpeningSequence() {
  const [showOpening, setShowOpening] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Hide opening sequence after 1 second (desktop only)
    const timer = setTimeout(() => {
      setShowOpening(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Don't show opening sequence on mobile
  if (isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {showOpening && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="w-full h-full flex items-center justify-center gap-0 px-8 md:px-16">
            {/* Portrait 1 - Left */}
            <motion.div
              className="relative h-[85vh] flex-1 border-y border-l border-white/30 overflow-hidden"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 0, opacity: 0, scale: 1 }}
            >
              <Image
                src="/photos/chelsea.jpg"
                alt="Samuel Vanderpump"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            </motion.div>

            {/* Portrait 2 - Center (Larger) */}
            <motion.div
              className="relative h-[90vh] flex-[1.3] border-y border-x border-white/30 overflow-hidden mx-2 md:mx-4"
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ x: 0, opacity: 0, scale: 1 }}
            >
              <Image
                src="/photos/vanderpod-profile.jpg"
                alt="Samuel Vanderpump"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            </motion.div>

            {/* Portrait 3 - Right */}
            <motion.div
              className="relative h-[85vh] flex-1 border-y border-r border-white/30 overflow-hidden"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 0, opacity: 0, scale: 1 }}
            >
              <Image
                src="/photos/portrait7.jpg"
                alt="Samuel Vanderpump"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
