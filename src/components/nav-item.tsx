"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface NavItemProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export default function NavItem({ children, href, onClick }: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <motion.span
      className="relative inline-block cursor-pointer"
      style={{
        fontFamily: "var(--font-inter)",
        fontWeight: 500,
        fontSize: "16px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <span className="text-white">{children}</span>
      
      {/* Animated underline - grows from left on hover */}
      {isHovered && (
        <motion.span
          className="absolute bottom-0 left-0 h-[1px] bg-white"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          exit={{ width: "0%" }}
          transition={{ 
            duration: 0.3, 
            ease: "easeInOut" 
          }}
        />
      )}
      
      {/* Animated underline - shrinks from left on unhover */}
      {!isHovered && (
        <motion.span
          className="absolute bottom-0 left-0 h-[1px] bg-white"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ 
            duration: 0.3, 
            ease: "easeInOut" 
          }}
        />
      )}
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }

  return content;
}
