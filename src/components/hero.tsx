"use client";

import { motion } from "framer-motion";
import About from "./about";
import { useOpeningDelay } from "@/hooks/use-opening-delay";

export default function Hero() {
  const showHero = useOpeningDelay();

  if (!showHero) {
    return null;
  }

  return (
    <section className="relative z-20 min-h-screen flex flex-col justify-between px-8 md:px-16 pt-32 md:pt-40 pb-4 md:pb-16">
      {/* Hero Text - Top Left */}
      <div className="text-left">
        {/* Samuel - Instrument Serif 400 Italic */}
        <div className="overflow-hidden">
          <motion.h1 
            className="text-white leading-none text-[40px] md:text-[150px]"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontStyle: "italic",
              fontWeight: 400,
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
            className="text-white leading-none text-[40px] md:text-[150px]"
            style={{
              fontFamily: "var(--font-inter)",
              fontStyle: "normal",
              fontWeight: 700,
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
      <div className={"pt-24"}>
        <About />
      </div>
    </section>
  );
}
