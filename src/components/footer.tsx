"use client";

import { motion } from "framer-motion";
import NavItem from "./nav-item";
import { useOpeningDelay } from "@/hooks/use-opening-delay";

export default function Footer() {
  const showFooter = useOpeningDelay();

  if (!showFooter) {
    return null;
  }

  return (
    <footer className="relative z-10 pb-4 px-8 md:px-16">
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
