"use client";

import SectionCard from "./section-card";
import { aboutContent } from "@/data/content";

export default function About() {
  return (
    <SectionCard 
      number={aboutContent.number} 
      title={aboutContent.title} 
      delay={0.3}
      fullWidthLine={true}
    >
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "1.6",
        }}
      >
        {aboutContent.description}
      </p>
    </SectionCard>
  );
}
