"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import NavItem from "./nav-item";

export default function Footer() {
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    // Show footer after opening sequence (same timing as Hero and ContentSections)
    const timer = setTimeout(() => {
      setShowFooter(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!showFooter) {
    return null;
  }

  return (
    <footer className="relative z-10 pb-4 px-16">
      {/* Animated line - full width */}
      <motion.div
        className="w-full h-[4px] bg-white mb-4"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ 
          duration: 1, 
          ease: "linear"
        }}
      />

      {/* Footer content */}
        <NavItem href="https://vanderpump.tech">
          Made by Vanderpump Tech
        </NavItem>
    </footer>
  );
}
