import OpeningSequence from "@/components/opening-sequence";
import FixedBackground from "@/components/fixed-background";
import Hero from "@/components/hero";
import Navigation from "@/components/navigation";

export default function Home() {
  return (
    <>
      {/* Opening Sequence - Three Portraits */}
      <OpeningSequence />
      
      {/* Fixed Background Image - Stays in place */}
      <FixedBackground />
      
      {/* Navigation - Fixed above everything */}
      <Navigation />
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Hero - Scrolls away normally */}
        <Hero />
        
        {/* Additional content areas */}
        <div className="min-h-screen" />
        <div className="min-h-screen" />
      </div>
    </>
  );
}
