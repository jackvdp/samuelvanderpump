import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import { KartGameLoader } from "@/components/kart/kart-game";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Chelsea Kart | Samuel Vanderpump",
  description:
    "Race as the Made in Chelsea cast around a blocky PFI, the Lincolnshire kart circuit, bridge and all — on your phone or desktop. Pick your driver and go three laps.",
  openGraph: {
    title: "Chelsea Kart | Samuel Vanderpump",
    description: "Pick a Made in Chelsea cast member and race three laps, right in your browser.",
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
