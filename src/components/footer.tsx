"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import NavItem from "./nav-item";

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <footer ref={ref} className="relative z-10 pb-4 px-16">
      {/* Animated line - full width */}
      <motion.div
        className="w-full h-[4px] bg-white mb-4"
        initial={{ width: 0 }}
        animate={isInView ? { width: "100%" } : { width: 0 }}
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
