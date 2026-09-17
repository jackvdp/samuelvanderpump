"use client";

import dynamic from "next/dynamic";

// three.js and the world builder are only loaded in the browser, on demand
const KartGameClient = dynamic(() => import("./kart-game-client"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#7ec0ff] text-center">
      <div className="font-pixel text-2xl text-white [text-shadow:3px_3px_0_rgba(0,0,0,0.55)]">
        CHELSEA KART
      </div>
      <p className="mt-4 animate-pulse font-pixel text-[10px] text-white/80">BUILDING THE KING&apos;S ROAD…</p>
    </div>
  ),
});

export function KartGameLoader() {
  return <KartGameClient />;
}
