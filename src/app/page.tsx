import Hero from "@/components/hero";
import Bio from "@/components/bio";
import OpeningSequence from "@/components/opening-sequence";
import { HexagonGridPatternShaders } from "@/components/shaders/hexagon";

export default function Home() {
  return (
    <>
      {/* Opening Sequence - Three Portraits */}
      <OpeningSequence />
      
      {/* Fixed Background Pattern */}
      <HexagonGridPatternShaders
        speed={0.5}
        scale={4.0}
        showGrid={false}
        patternDensity={1.0}
      />
      
      {/* Hero Section - Revealed after opening */}
      <Hero />
      
      {/* Bio Section */}
      <Bio />
    </>
  );
}
