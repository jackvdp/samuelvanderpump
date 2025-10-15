"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function OpeningSequence() {
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    // Hide opening sequence after 2.5 seconds
    const timer = setTimeout(() => {
      setShowOpening(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showOpening && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="w-full h-full flex items-center justify-center gap-0 px-8 md:px-16">
            {/* Portrait 1 - Left */}
            <motion.div
              className="relative h-[85vh] flex-1 border-y border-l border-[#D4AF37]/30 overflow-hidden"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0, scale: 0.9 }}
              transition={{ 
                initial: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
                exit: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
              }}
            >
              <Image
                src="/photos/portrait1.JPG"
                alt="Samuel Vanderpump"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            </motion.div>

            {/* Portrait 2 - Center (Larger) */}
            <motion.div
              className="relative h-[90vh] flex-[1.3] border-y border-x border-[#D4AF37]/30 overflow-hidden mx-2 md:mx-4"
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -400, opacity: 0, scale: 0.85 }}
              transition={{ 
                initial: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
                exit: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }
              }}
            >
              <Image
                src="/photos/portrait2.JPG"
                alt="Samuel Vanderpump"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            </motion.div>

            {/* Portrait 3 - Right */}
            <motion.div
              className="relative h-[85vh] flex-1 border-y border-r border-[#D4AF37]/30 overflow-hidden"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0, scale: 0.9 }}
              transition={{ 
                initial: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
                exit: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
              }}
            >
              <Image
                src="/photos/portrait3.JPG"
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
