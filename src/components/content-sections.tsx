"use client";

import SectionCard from "./section-card";
import { contentSections } from "@/data/content";
import Image from "next/image";
import { useOpeningDelay } from "@/hooks/use-opening-delay";
import { SiInstagram, SiLinkedin, SiTiktok, SiFacebook } from "react-icons/si";

const socialIconMap = {
  Instagram: SiInstagram,
  LinkedIn: SiLinkedin,
  TikTok: SiTiktok,
  Facebook: SiFacebook,
};

export default function ContentSections() {
  const showSections = useOpeningDelay();

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
                  className="text-white"
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
                <p className={"text-white/70"}
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
                      {/* Logo (if exists) */}
                      {show.logo && (
                        <div className="mb-4">
                          <Image
                            src={show.logo}
                            alt={show.name}
                            width={128}
                            height={128}
                            className="object-contain w-32 h-auto"
                          />
                        </div>
                      )}

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
                            className={"text-white/70"}
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
                      {/* Logo (if exists) */}
                      {charity.logo && (
                        <div className="mb-4">
                          {charity.link ? (
                            <a
                              href={charity.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <Image
                                src={charity.logo}
                                alt={charity.organization}
                                width={256}
                                height={256}
                                className="object-contain w-32 h-auto"
                              />
                            </a>
                          ) : (
                            <Image
                              src={charity.logo}
                              alt={charity.organization}
                              width={256}
                              height={256}
                              className="object-contain w-32 h-auto"
                            />
                          )}
                        </div>
                      )}

                      {charity.link ? (
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
                        <p className={"text-white/70"}
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

              {/* Social Links (if exists - Contact section) */}
              {section.socialLinks && section.socialLinks.length > 0 && (
                <div className="flex items-center gap-4 pt-4">
                  {section.socialLinks.map((social) => {
                    const Icon = socialIconMap[social.platform as keyof typeof socialIconMap];
                    return Icon ? (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:opacity-70 transition-opacity"
                        aria-label={social.platform}
                      >
                        <Icon className="w-6 h-6" />
                      </a>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </SectionCard>
        </section>
      ))}
    </div>
  );
}
