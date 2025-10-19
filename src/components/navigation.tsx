"use client";

import { useState, useEffect } from "react";
import NavItem from "./nav-item";
import {SiInstagram, SiLinkedin, SiTiktok, SiFacebook, SiYoutube} from "react-icons/si";

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

  const socialLinks = [
    { icon: SiInstagram, href: "https://www.instagram.com/samvanderpump?igsh=ZXFjN3l1eHBjczk0&utm_source=qr", label: "Instagram" },
    { icon: SiLinkedin, href: "https://www.linkedin.com/in/samuel-vanderpump-520660110?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app", label: "LinkedIn" },
    { icon: SiTiktok, href: "https://www.tiktok.com/@sam_vanderpump?_t=ZN-90gj6HPu0MJ&_r=1", label: "TikTok" },
    { icon: SiFacebook, href: "https://www.facebook.com/share/1GbjL4uGQw/?mibextid=wwXIfr", label: "Facebook" },
    { icon: SiYoutube, url: "https://youtube.com/@vanderpodofficial?si=6h4zXKH2vTt5jvS0", label: "Youtube" },
  ];

  return (
    <nav className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-8 md:px-16 pt-4">
        {/* Top Left - Samuel Vanderpump */}
        <div className="pointer-events-auto">
          <NavItem>Samuel Vanderpump</NavItem>
        </div>

        {/* Top Right - Contact & Social Icons */}
        <div className="pointer-events-auto flex items-center gap-6">
          <NavItem href="mailto:hello@samuelvanderpump.com">Contact</NavItem>
          
          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:opacity-70 transition-opacity"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Right - Scroll indicator */}
      <div className="absolute bottom-0 right-0 px-8 md:px-16 hidden md:block pb-4">
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
