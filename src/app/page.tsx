import Hero from "@/components/hero";
import Bio from "@/components/bio";
import { HexagonGridPatternShaders } from "@/components/shaders/hexagon";

export default function Home() {
  return (
    <>
      {/* Fixed Background Pattern */}
      <HexagonGridPatternShaders
        speed={0.5}
        scale={4.0}
        showGrid={false}
        patternDensity={1.0}
      />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Bio Section */}
      <Bio />
    </>
  );
}
