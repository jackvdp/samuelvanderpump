import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import { KartGameLoader } from "@/components/kart/kart-game";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Block Kart | Samuel Vanderpump",
  description:
    "A blocky kart racer you can play in the browser — on your phone or desktop. Three laps, four karts, one very square island.",
  openGraph: {
    title: "Block Kart | Samuel Vanderpump",
    description: "A blocky kart racer you can play right in your browser.",
    type: "website",
  },
};

// the game owns the whole screen: no pinch-zoom, draw under the notch
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#7ec0ff",
};

export default function KartPage() {
  return (
    <div className={pixel.variable}>
      <KartGameLoader />
    </div>
  );
}
