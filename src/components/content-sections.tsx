"use client";

import { useState, useEffect } from "react";
import SectionCard from "./section-card";
import { contentSections } from "@/data/content";
import Image from "next/image";

export default function ContentSections() {
  const [showSections, setShowSections] = useState(false);

  useEffect(() => {
    // Show sections after opening sequence (same timing as Hero)
    const timer = setTimeout(() => {
      setShowSections(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!showSections) {
    return null;
  }

  return (
    <div className="relative z-10 pb-32 pt-16">
      {contentSections.map((section, index) => (
        <section key={index} className="px-8 md:px-16 pb-24" data-section={section.id}>
          <SectionCard 
            number={section.number}
            title={section.title}
            delay={0}
          >
            <div className="space-y-4">
              {/* Logo (if exists) */}
              {section.logo && section.link && (
                <a 
                  href={section.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <div className="relative w-64 h-auto mb-4">
                    <Image
                        src={section.logo}
                        alt={section.title}
                        width={256}
                        height={256}
                        className="object-contain w-full h-auto"
                    />
                  </div>
                </a>
              )}

              {/* Role (if exists) */}
              {section.role && (
                <p
                  className="text-white/70"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    fontSize: "14px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {section.role}
                </p>
              )}

              {/* Description (if exists) */}
              {section.description && (
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "1.6",
                  }}
                >
                  {section.description}
                </p>
              )}

              {/* Link (if exists) */}
              {section.link && section.linkText && (
                <a
                  href={section.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-white underline hover:opacity-70 transition-opacity"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    fontSize: "16px",
                  }}
                >
                  {section.linkText} →
                </a>
              )}

              {/* Shows (if exists - Television section) */}
              {section.shows && section.shows.length > 0 && (
                <div className="space-y-6">
                  {section.shows.map((show, showIndex) => (
                    <div key={showIndex} className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <h4
                          className="text-white"
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontWeight: 600,
                            fontSize: "16px",
                          }}
                        >
                          {show.name}
                        </h4>
                        {show.network && (
                          <span
                            className="text-white/70"
                            style={{
                              fontFamily: "var(--font-inter)",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                          >
                            {show.network}
                          </span>
                        )}
                      </div>
                      {show.description && (
                        <p
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontWeight: 500,
                            fontSize: "16px",
                            lineHeight: "1.6",
                          }}
                        >
                          {show.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Ambassadorships (if exists - Charity section) */}
              {section.ambassadorships && section.ambassadorships.length > 0 && (
                <div className="space-y-6">
                  {section.ambassadorships.map((charity, charityIndex) => (
                    <div key={charityIndex} className="space-y-2">
                      {charity.link ? (
                        <a
                          href={charity.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <h4
                            className="text-white/70 hover:opacity-70 transition-opacity"
                            style={{
                              fontFamily: "var(--font-inter)",
                              fontWeight: 600,
                              fontSize: "16px",
                            }}
                          >
                            {charity.organization}
                            {charity.division && ` - ${charity.division}`}
                          </h4>
                        </a>
                      ) : (
                        <h4
                          className="text-white"
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontWeight: 600,
                            fontSize: "16px",
                          }}
                        >
                          {charity.organization}
                          {charity.division && ` - ${charity.division}`}
                        </h4>
                      )}
                      {charity.description && (
                        <p
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontWeight: 500,
                            fontSize: "16px",
                            lineHeight: "1.6",
                          }}
                        >
                          {charity.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Email (if exists - Contact section) */}
              {section.email && (
                <a
                  href={`mailto:${section.email}`}
                  className="inline-block text-white underline hover:opacity-70 transition-opacity"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    fontSize: "16px",
                  }}
                >
                  {section.email}
                </a>
              )}
            </div>
          </SectionCard>
        </section>
      ))}
    </div>
  );
}
