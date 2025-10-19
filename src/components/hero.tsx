"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

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
    <section className="relative z-20 min-h-screen flex items-start p-8 md:p-16">
      <motion.div
        className="text-left"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Samuel - Instrument Serif 400 Italic */}
        <h1 
          className="text-white leading-none"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "200px",
          }}
        >
          Samuel
        </h1>
        
        {/* Vanderpump - Inter 700 */}
        <h2 
          className="text-white leading-none"
          style={{
            fontFamily: "var(--font-inter)",
            fontStyle: "normal",
            fontWeight: 700,
            fontSize: "200px",
          }}
        >
          Vanderpump
        </h2>
      </motion.div>
    </section>
  );
}
