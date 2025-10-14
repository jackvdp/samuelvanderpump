"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Bio() {
  return (
    <section className="relative">
      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-32 py-32"
      >
        <p className="font-great-vibes text-8xl text-[#D4AF37] mb-24 text-center">
          About
        </p>
        <p className="font-playfair text-3xl md:text-4xl lg:text-5xl text-white/90 leading-relaxed max-w-6xl mx-auto text-center">
          Entrepreneur, social media figure, and television personality. Managing Director of Vanderpump FX 
          and former CEO of Dapio Payments, with a passion for business innovation and philanthropy.
        </p>
      </motion.div>

      {/* Portrait Image 1 with Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="min-h-screen flex items-center justify-center px-8 md:px-16 lg:px-32 py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl w-full items-center">
          <div className="relative h-[70vh] lg:h-[80vh] w-full border border-[#D4AF37]/20 overflow-hidden">
            <Image
              src="/photos/portrait1.JPG"
              alt="Samuel Vanderpump"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-great-vibes text-6xl md:text-7xl lg:text-8xl text-[#D4AF37] mb-8">
              Visionary Leader
            </h3>
            <p className="font-playfair text-2xl md:text-3xl lg:text-4xl text-white/80 leading-relaxed">
              Building the future of finance and media through innovation, dedication, and strategic vision.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Vanderpump FX Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-32 py-32"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="font-great-vibes text-8xl md:text-[10rem] lg:text-[12rem] text-[#D4AF37] mb-16 text-center">
            Vanderpump FX
          </h3>
          <p className="font-playfair text-3xl md:text-4xl lg:text-5xl text-white/80 leading-relaxed mb-16 text-center">
            A premier currency exchange brokerage, helping individuals and businesses navigate the complexities 
            of foreign exchange with expert guidance and competitive rates.
          </p>
          <div className="flex justify-center">
            <a
              href="https://vanderpumpfx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-playfair text-[#D4AF37] text-xl md:text-2xl tracking-wider uppercase border border-[#D4AF37]/50 px-16 py-6 hover:bg-[#D4AF37]/10 transition-all duration-300"
            >
              Visit Vanderpump FX →
            </a>
          </div>
        </div>
      </motion.div>

      {/* Landscape Image 1 - Full width edge to edge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="relative h-screen w-full border-y border-[#D4AF37]/20 overflow-hidden">
          <Image
            src="/photos/landscape1.JPG"
            alt="Samuel Vanderpump Professional"
            fill
            className="object-cover object-center"
          />
        </div>
      </motion.div>

      {/* Vanderpod Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-32 py-32"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="font-great-vibes text-8xl md:text-[10rem] lg:text-[12rem] text-[#D4AF37] mb-16 text-center">
            Vanderpod
          </h3>
          <p className="font-playfair text-3xl md:text-4xl lg:text-5xl text-white/80 leading-relaxed text-center">
            Founder and presenter of Vanderpod, a dynamic podcast exploring business, lifestyle, 
            and personal growth with engaging conversations from industry leaders.
          </p>
        </div>
      </motion.div>

      {/* Portrait Image 2 with Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="min-h-screen flex items-center justify-center px-8 md:px-16 lg:px-32 py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl w-full items-center">
          <div className="flex flex-col justify-center lg:order-2">
            <h3 className="font-great-vibes text-6xl md:text-7xl lg:text-8xl text-[#D4AF37] mb-8">
              Media Presence
            </h3>
            <p className="font-playfair text-2xl md:text-3xl lg:text-4xl text-white/80 leading-relaxed">
              Bringing authenticity and charisma to every platform, connecting with audiences worldwide.
            </p>
          </div>
          <div className="relative h-[70vh] lg:h-[80vh] w-full border border-[#D4AF37]/20 overflow-hidden lg:order-1">
            <Image
              src="/photos/portrait2.JPG"
              alt="Samuel Vanderpump Portrait"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </motion.div>

      {/* Television Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-32 py-32"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="font-great-vibes text-8xl md:text-[10rem] lg:text-[12rem] text-[#D4AF37] mb-16 text-center">
            Television
          </h3>
          <p className="font-playfair text-3xl md:text-4xl lg:text-5xl text-white/80 leading-relaxed text-center">
            Featured on <span className="text-[#D4AF37]">Made in Chelsea</span> and{" "}
            <span className="text-[#D4AF37]">Vanderpump Villa</span>, sharing insights into business and lifestyle 
            with audiences around the world.
          </p>
        </div>
      </motion.div>

      {/* Landscape Image 2 - Full width edge to edge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="relative h-screen w-full border-y border-[#D4AF37]/20 overflow-hidden">
          <Image
            src="/photos/landscape2.JPG"
            alt="Samuel Vanderpump Television"
            fill
            className="object-cover object-center"
          />
        </div>
      </motion.div>

      {/* Philanthropy Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-32 py-32"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="font-great-vibes text-8xl md:text-[10rem] lg:text-[12rem] text-[#D4AF37] mb-16 text-center">
            Philanthropy
          </h3>
          <p className="font-playfair text-3xl md:text-4xl lg:text-5xl text-white/80 leading-relaxed mb-16 text-center">
            Proud ambassador for the <span className="text-[#D4AF37]">UK Sepsis Trust</span> and{" "}
            <span className="text-[#D4AF37]">NHS Organ Donor and Transplant</span> charities, 
            dedicated to raising awareness and supporting life-saving initiatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <a
              href="https://sepsistrust.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-playfair text-[#D4AF37] text-xl tracking-wider uppercase border border-[#D4AF37]/50 px-12 py-6 hover:bg-[#D4AF37]/10 transition-all duration-300 text-center"
            >
              UK Sepsis Trust →
            </a>
            <a
              href="https://www.organdonation.nhs.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-playfair text-[#D4AF37] text-xl tracking-wider uppercase border border-[#D4AF37]/50 px-12 py-6 hover:bg-[#D4AF37]/10 transition-all duration-300 text-center"
            >
              NHS Organ Donation →
            </a>
          </div>
        </div>
      </motion.div>

      {/* Portrait Image 3 with Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="min-h-screen flex items-center justify-center px-8 md:px-16 lg:px-32 py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl w-full items-center">
          <div className="relative h-[70vh] lg:h-[80vh] w-full border border-[#D4AF37]/20 overflow-hidden">
            <Image
              src="/photos/portrait3.JPG"
              alt="Samuel Vanderpump"
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-great-vibes text-6xl md:text-7xl lg:text-8xl text-[#D4AF37] mb-8">
              Making Impact
            </h3>
            <p className="font-playfair text-2xl md:text-3xl lg:text-4xl text-white/80 leading-relaxed">
              Committed to creating positive change through business excellence and charitable endeavors.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
