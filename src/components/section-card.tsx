"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionCardProps {
  number: string;
  title: string;
  children: ReactNode;
  delay?: number;
  width?: string;
}

export default function SectionCard({ 
  number, 
  title, 
  children, 
  delay = 0.3,
  width = "66.666%"
}: SectionCardProps) {
  return (
    <div className="pr-16" style={{ width }}>
      {/* Animated top line */}
      <motion.div
        className="w-full h-[3px] bg-white mb-8"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ 
          duration: 1, 
          ease: [0.22, 1, 0.36, 1],
          delay
        }}
      />

      {/* Content */}
      <motion.div
        className="flex items-start gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: delay + 0.5,
          ease: "easeOut" 
        }}
      >
        {/* Number */}
        <div
          className="text-white flex-shrink-0"
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 500,
            fontSize: "16px",
          }}
        >
          {number}
        </div>

        {/* Title */}
        <h3
          className="text-white flex-shrink-0"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "40px",
            lineHeight: "1",
          }}
        >
          {title}
        </h3>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Content - Right 40% */}
        <div className="text-white" style={{ width: "40%" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
