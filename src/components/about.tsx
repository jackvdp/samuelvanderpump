"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="w-2/3 pr-16">
      {/* Animated top line - thicker */}
      <motion.div
        className="w-full h-[3px] bg-white mb-8"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ 
          duration: 1, 
          ease: [0.22, 1, 0.36, 1],
          delay: 0.3
        }}
      />

      {/* Content */}
      <motion.div
        className="flex items-start gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.8,
          ease: "easeOut" 
        }}
      >
        {/* Number - 00 */}
        <div
          className="text-white flex-shrink-0"
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 500,
            fontSize: "16px",
          }}
        >
          00
        </div>

        {/* Title - About */}
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
          About
        </h3>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Paragraph - Right 40% */}
        <div className="text-white" style={{ width: "40%" }}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Samuel Vanderpump is a visionary entrepreneur and philanthropist dedicated to innovation and positive global impact. With a career spanning technology, sustainable development, and social enterprise, Samuel has pioneered initiatives that bridge the gap between cutting-edge innovation and meaningful societal change.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
