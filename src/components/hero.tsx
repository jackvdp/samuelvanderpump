"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

export default function Hero() {
  const { scrollY } = useScroll();
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    // Show hero after opening sequence (4 seconds)
    const timer = setTimeout(() => {
      setShowHero(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);
  
  // Parallax effect for the title - moves slower than scroll
  const titleY = useTransform(scrollY, [0, 500], [0, 150]);
  const titleOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  // Parallax for subtitle
  const subtitleY = useTransform(scrollY, [0, 500], [0, 100]);
  const subtitleOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  if (!showHero) {
    return null; // Don't render hero during opening sequence
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8">
      {/* Animated Gold Glow Effect */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          initial: { duration: 1.5 },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Main Title */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative z-10 text-center"
      >
        <motion.h1
          className="font-great-vibes text-[clamp(4rem,15vw,12rem)] text-[#D4AF37] leading-none tracking-wide"
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          Samuel Vanderpump
        </motion.h1>

        {/* Decorative Line */}
        <motion.div
          className="mt-8 mb-8 mx-auto w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 128, opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: 0.8,
            ease: "easeOut",
          }}
        />

        {/* Subtitle */}
        <motion.p
          style={{ y: subtitleY, opacity: subtitleOpacity }}
          className="font-playfair text-xl md:text-2xl text-[#D4AF37]/90 tracking-[0.3em] uppercase"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 1.2,
            ease: "easeOut",
          }}
        >
          Entrepreneur · Innovator · Philanthropist
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: 2,
          ease: "easeOut",
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[#D4AF37] text-sm tracking-[0.2em] uppercase font-playfair">
            Scroll
          </span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4AF37] to-transparent" />
        </div>
      </motion.div>

      {/* Animated Corner Accents */}
      <motion.div
        className="absolute top-8 left-8 w-24 h-24 border-l border-t border-[#D4AF37]/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
      />
      <motion.div
        className="absolute top-8 right-8 w-24 h-24 border-r border-t border-[#D4AF37]/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 1.6, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-8 left-8 w-24 h-24 border-l border-b border-[#D4AF37]/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 1.7, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-8 right-8 w-24 h-24 border-r border-b border-[#D4AF37]/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 1.8, ease: "easeOut" }}
      />
    </section>
  );
}
