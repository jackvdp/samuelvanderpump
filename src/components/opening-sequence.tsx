"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function OpeningSequence() {
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    // Hide opening sequence after 4 seconds
    const timer = setTimeout(() => {
      setShowOpening(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showOpening && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <div className="w-full h-full flex items-center justify-center gap-0 px-8 md:px-16">
            {/* Portrait 1 - Left */}
            <motion.div
              className="relative h-[85vh] flex-1 border-y border-l border-[#D4AF37]/30 overflow-hidden"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0, scale: 0.9 }}
              transition={{ 
                initial: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
                exit: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
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
                initial: { duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
                exit: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
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
              
              {/* Gold accent line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>

            {/* Portrait 3 - Right */}
            <motion.div
              className="relative h-[85vh] flex-1 border-y border-r border-[#D4AF37]/30 overflow-hidden"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0, scale: 0.9 }}
              transition={{ 
                initial: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 },
                exit: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }
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

          {/* Animated name overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <motion.h1
              className="font-great-vibes text-7xl md:text-9xl lg:text-[10rem] text-[#D4AF37] text-center px-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ 
                initial: { duration: 1, delay: 2, ease: "easeOut" },
                exit: { duration: 0.6, ease: "easeIn" }
              }}
            >
              Samuel Vanderpump
            </motion.h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
