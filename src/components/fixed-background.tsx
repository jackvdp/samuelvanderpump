"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useOpeningDelay } from "@/hooks/use-opening-delay";

export default function FixedBackground() {
  const showBackground = useOpeningDelay();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentImage, setCurrentImage] = useState("/photos/portraitHero1.JPG");

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Detect scroll position and toggle width + change images based on section
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Toggle width animation (desktop only)
      if (scrollY > 1) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Change image based on which section is in view
      // Get all section elements
      const vanderpumpfxSection = document.querySelector('[data-section="vanderpump-fx"]');
      const vanderpodSection = document.querySelector('[data-section="vanderpod"]');
      const tvSection = document.querySelector('[data-section="television"]');

      if (vanderpumpfxSection) {
        const rect = vanderpumpfxSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2;
        
        if (inView) {
          setCurrentImage("/photos/portrait3.JPG");
          return;
        }
      }

      if (vanderpodSection) {
        const rect = vanderpodSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2;

        if (inView) {
          setCurrentImage("/photos/vanderpod-profile.jpg");
          return;
        }
      }

      if (tvSection) {
        const rect = tvSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2;
        
        if (inView) {
          setCurrentImage("/photos/chelsea.jpg");
          return;
        }
      }

      // Default image for other sections
      setCurrentImage("/photos/portraitHero1.JPG");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!showBackground) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 flex items-center justify-end">
      <motion.div
        className="relative h-full w-full"
        initial={{ width: "100vw" }}
        animate={{ 
          width: isMobile ? "100vw" : (isScrolled ? "33.333vw" : "100vw")
        }}
        transition={{ 
          duration: 1.0,
          ease: [0.25, 0.1, 0.25, 0.1]
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={currentImage}
              alt="Samuel Vanderpump"
              fill
              className="object-cover object-center"
              priority={currentImage === "/photos/portraitHero1.JPG"}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Gradient overlays - darker on left, right, and bottom edges */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left edge - dark to transparent */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/95 to-transparent" />
          
          {/* Right edge - dark to transparent */}
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/95 to-transparent" />
          
          {/* Bottom edge - dark to transparent */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 to-transparent" />
        </div>

        {/* Mobile darkening overlay */}
        <motion.div
          className="absolute inset-0 bg-black pointer-events-none md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolled ? 0.7 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
