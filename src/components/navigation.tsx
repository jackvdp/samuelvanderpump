"use client";

import { useState, useEffect } from "react";
import NavItem from "./nav-item";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToFirstSection = () => {
    const firstSection = document.querySelector('[data-section]');
    if (firstSection) {
      const offsetTop = firstSection.getBoundingClientRect().top + window.scrollY;
      const padding = 80; // Add some padding from the top
      window.scrollTo({ top: offsetTop - padding, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between pr-16 pl-16 pt-4">
        {/* Top Left - Samuel Vanderpump */}
        <div className="pointer-events-auto">
          <NavItem>Samuel Vanderpump</NavItem>
        </div>

        {/* Top Right - Contact */}
        <div className="pointer-events-auto">
          <NavItem href="mailto:info@samuelvanderpump.com">Contact</NavItem>
        </div>
      </div>

      {/* Bottom Right - Scroll indicator */}
      <div className="absolute bottom-0 right-0 pr-16 pb-4">
        <div className="pointer-events-auto">
          {isScrolled ? (
            <NavItem onClick={scrollToTop}>Back to top</NavItem>
          ) : (
            <NavItem onClick={scrollToFirstSection}>Scroll down</NavItem>
          )}
        </div>
      </div>
    </nav>
  );
}
