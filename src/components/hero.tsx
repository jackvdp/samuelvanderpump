"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import About from "./about";

export default function Hero() {
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    // Show hero after opening sequence (1 second)
    const timer = setTimeout(() => {
      setShowHero(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!showHero) {
    return null;
  }

  return (
    <section className="relative z-20 min-h-screen flex flex-col justify-between pl-16 pr-32 pt-32 md:pt-40 pb-8">
      {/* Hero Text - Top Left */}
      <div className="text-left">
        {/* Samuel - Instrument Serif 400 Italic */}
        <div className="overflow-hidden">
          <motion.h1 
            className="text-white leading-none"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "150px",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ 
              duration: 1.5, 
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3
            }}
          >
            Samuel
          </motion.h1>
        </div>
        
        {/* Vanderpump - Inter 700 */}
        <div className="overflow-hidden">
          <motion.h2 
            className="text-white leading-none"
            style={{
              fontFamily: "var(--font-inter)",
              fontStyle: "normal",
              fontWeight: 700,
              fontSize: "150px",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ 
              duration: 1.5, 
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3
            }}
          >
            Vanderpump
          </motion.h2>
        </div>
      </div>

      {/* About - Bottom Left */}
      <About />
    </section>
  );
}
