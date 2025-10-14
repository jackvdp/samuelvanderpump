import type { Metadata } from "next";
import { Herr_Von_Muellerhoff, Playfair_Display } from "next/font/google";
import "./globals.css";

const herrVonMuellerhoff = Herr_Von_Muellerhoff({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samuel Vanderpump",
  description: "Entrepreneur · Innovator · Philanthropist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${herrVonMuellerhoff.variable} ${playfair.variable}`}>
      <body className={playfair.className}>{children}</body>
    </html>
  );
}
