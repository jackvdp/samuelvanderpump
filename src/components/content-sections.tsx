"use client";

import SectionCard from "./section-card";
import { websiteContent } from "@/data/content";
import Image from "next/image";

export default function ContentSections() {
  return (
    <div className="relative z-10 space-y-24 pb-32">
      {/* Vanderpump FX */}
      <section className="px-8 md:px-16">
        <SectionCard 
          number={websiteContent.vanderpumpFX.number}
          title={websiteContent.vanderpumpFX.title}
          delay={0}
        >
          <div className="space-y-4">
            {/* Logo */}
            <a 
              href={websiteContent.vanderpumpFX.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={websiteContent.vanderpumpFX.logo}
                  alt="Vanderpump FX"
                  fill
                  className="object-contain"
                />
              </div>
            </a>

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
                  {websiteContent.vanderpumpFX.role}
              </p>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "1.6",
              }}
            >
              {websiteContent.vanderpumpFX.description}
            </p>

            {/* Link */}
            <a
              href={websiteContent.vanderpumpFX.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-white underline hover:opacity-70 transition-opacity"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              Visit Vanderpump FX →
            </a>
          </div>
        </SectionCard>
      </section>

      {/* Vanderpod */}
      <section className="px-8 md:px-16">
        <SectionCard 
          number={websiteContent.vanderpod.number}
          title={websiteContent.vanderpod.title}
          delay={0}
        >
          <div className="space-y-4">
            {/* Logo */}
            <a 
              href={websiteContent.vanderpod.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={websiteContent.vanderpod.logo}
                  alt="Vanderpod"
                  fill
                  className="object-contain"
                />
              </div>
            </a>

            {/* Role */}
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
              {websiteContent.vanderpod.role}
            </p>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "1.6",
              }}
            >
              {websiteContent.vanderpod.description}
            </p>

            {/* Link */}
            <a
              href={websiteContent.vanderpod.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-white underline hover:opacity-70 transition-opacity"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              Listen to Vanderpod →
            </a>
          </div>
        </SectionCard>
      </section>

      {/* Television */}
      <section className="px-8 md:px-16">
        <SectionCard 
          number={websiteContent.television.number}
          title={websiteContent.television.title}
          delay={0}
        >
          <div className="space-y-6">
            {websiteContent.television.shows.map((show, index) => (
              <div key={index} className="space-y-2">
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
                </div>
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
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      {/* Charitable Work */}
      <section className="px-8 md:px-16">
        <SectionCard 
          number={websiteContent.charity.number}
          title={websiteContent.charity.title}
          delay={0}
        >
          <div className="space-y-6">
            {websiteContent.charity.ambassadorships.map((charity, index) => (
              <div key={index} className="space-y-2">
                <a
                  href={charity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <h4
                    className="text-white hover:opacity-70 transition-opacity"
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
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      {/* Contact */}
      <section className="px-8 md:px-16">
        <SectionCard 
          number={websiteContent.contact.number}
          title={websiteContent.contact.title}
          delay={0}
        >
          <div className="space-y-4">
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "1.6",
              }}
            >
              {websiteContent.contact.description}
            </p>

            <a
              href={`mailto:${websiteContent.contact.email}`}
              className="inline-block text-white underline hover:opacity-70 transition-opacity"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              {websiteContent.contact.email}
            </a>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
