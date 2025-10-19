import OpeningSequence from "@/components/opening-sequence";

export default function Home() {
  return (
    <>
      {/* Opening Sequence - Three Portraits */}
      <OpeningSequence />
      
      {/* Solid Black Background after opening */}
      <div className="min-h-screen bg-black" />
    </>
  );
}
