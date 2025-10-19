"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function FixedBackground() {
  const [showBackground, setShowBackground] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Show background after opening sequence (1 second)
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Detect scroll position and toggle width
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!showBackground) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 flex items-center justify-end">
      <motion.div
        className="relative h-full"
        initial={{ width: "100vw" }}
        animate={{ width: isScrolled ? "33.333vw" : "100vw" }}
        transition={{ 
          duration: 1.5,
          ease: [0.25, 0.1, 0.25, 0.1] // Smooth easing
        }}
      >
        <Image
          src="/photos/portraitHero5.JPG"
          alt="Samuel Vanderpump"
          fill
          className="object-cover object-center"
          priority
        />
      </motion.div>
    </div>
  );
}
