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
    // Detect scroll and trigger width change
    const handleScroll = () => {
      if (window.scrollY > 10 && !isScrolled) {
        setIsScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  if (!showBackground) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <motion.div
        className="absolute right-0 top-0 bottom-0 h-full"
        initial={{ width: "100%" }}
        animate={{ width: isScrolled ? "33.333%" : "100%" }}
        transition={{ 
          duration: 1.5, 
          ease: [0.25, 0.1, 0.25, 1] // Smooth easing
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/photos/portrait4.JPG"
            alt="Samuel Vanderpump"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}
