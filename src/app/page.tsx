import OpeningSequence from "@/components/opening-sequence";
import FixedBackground from "@/components/fixed-background";

export default function Home() {
  return (
    <>
      {/* Opening Sequence - Three Portraits */}
      <OpeningSequence />
      
      {/* Fixed Background Image - Scales from fill to fit on scroll */}
      <FixedBackground />
      
      {/* Content area with black background for scrolling */}
      <div className="relative z-10 min-h-[300vh] bg-transparent">
        <div className="min-h-screen" />
        <div className="min-h-screen" />
        <div className="min-h-screen" />
      </div>
    </>
  );
}
