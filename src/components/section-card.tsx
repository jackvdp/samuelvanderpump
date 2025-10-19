"use client";

import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

interface SectionCardProps {
  number: string;
  title: string;
  children: ReactNode;
  delay?: number;
  width?: string;
  fullWidthLine?: boolean;
}

export default function SectionCard({ 
  number, 
  title, 
  children, 
  delay = 0,
  width = "66.666%",
  fullWidthLine = false
}: SectionCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -200px 0px" });

  return (
    <div ref={ref} className="pr-16" style={{ width }}>
      {/* Animated top line */}
      <div className="relative mb-8">
        {fullWidthLine ? (
          // Full width thick line for About section
          <motion.div
            className="w-full h-[4px] bg-white"
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : { width: 0 }}
            transition={{ 
              duration: 1, 
              ease: [0.22, 1, 0.36, 1],
              delay
            }}
          />
        ) : (
          // Two lines: 250px thick line + full width thin line
          <>
            {/* Thick 250px line */}
            <motion.div
              className="absolute top-0 left-0 h-[4px] bg-white"
              style={{ width: "250px" }}
              initial={{ width: 0 }}
              animate={isInView ? { width: "250px" } : { width: 0 }}
              transition={{ 
                duration: 1, 
                ease: [0.22, 1, 0.36, 1],
                delay
              }}
            />
            {/* Thin full-width line */}
            <motion.div
              className="w-full h-[1px] bg-white/50"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ 
                duration: 1, 
                ease: [0.22, 1, 0.36, 1],
                delay: delay + 0.2
              }}
            />
          </>
        )}
      </div>

      {/* Content */}
      <motion.div
        className="flex items-start gap-4"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
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
