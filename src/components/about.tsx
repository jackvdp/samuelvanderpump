"use client";

import SectionCard from "./section-card";

export default function About() {
  return (
    <SectionCard number="00" title="About" delay={0.3}>
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "1.6",
        }}
      >
        Samuel Vanderpump is CEO and Founder of Vanderpump FX, specialising in finance and foreign exchange. Beyond his work in finance, Samuel serves as an ambassador for charitable organisations, and is recognised as a television personality and podcast host, connecting with audiences on topics spanning business, culture, and philanthropy.
      </p>
    </SectionCard>
  );
}
