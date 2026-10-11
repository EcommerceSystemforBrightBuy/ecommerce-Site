"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const HERO_SLIDES = [
  {
    id: 1,
    image: "/hero-section/1.png",
    alt: "BrightBuy - Your World of Electronics",
    href: "/products",
    badge: "New Spring 2026 Collection",
  },
  {
    id: 2,
    image: "/hero-section/2.png",
    alt: "BrightBuy Big Sale - Top Electronics",
    href: "/products",
    badge: "Big Tech Sale • Best Prices",
  },
  {
    id: 3,
    image: "/hero-section/3.png",
    alt: "BrightBuy - Upgrade Your Everyday",
    href: "/products",
    badge: "STEM & Digital Gadgets",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrent((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-[#EAE3DE] group bg-[#FAF3EE] aspect-[16/9] sm:aspect-[2/1] lg:aspect-[2.3/1] max-h-[500px] transition-all duration-300"
    >
      {/* Background Slides (Fits 100% into Space with No Cropping) */}
      {HERO_SLIDES.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <Link
            key={slide.id}
            href={slide.href}
            aria-label={slide.alt}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out cursor-pointer flex items-center justify-center overflow-hidden ${
              isActive
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-95 z-0 pointer-events-none"
            }`}
          >
            {/* Ambient Blurred Background to Fill Lateral Gutters Seamlessly */}
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-30 scale-125 pointer-events-none"
            />

            {/* Banner Image Scaled to Fit Entire Frame Perfectly - Never Cropped */}
            <img
              src={slide.image}
              alt={slide.alt}
              className="relative z-10 w-full h-full object-contain object-center transition-transform duration-700 ease-out"
            />
          </Link>
        );
      })}

      {/* Floating Modern Pill Badge */}
      <div className="absolute top-3.5 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E0D0C5] text-[#222222] text-[11px] font-black shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#FF385C] animate-pulse" />
        <span>{HERO_SLIDES[current].badge}</span>
      </div>

      {/* Navigation Arrows with Spring Hover Animation */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#222222] shadow-lg border border-[#E0D0C5] flex items-center justify-center transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
      >
        <ChevronLeft className="w-5 h-5 text-[#222222]" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#222222] shadow-lg border border-[#E0D0C5] flex items-center justify-center transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
      >
        <ChevronRight className="w-5 h-5 text-[#222222]" />
      </button>

      {/* Modern Progress Pill Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrent(idx);
              }}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? "w-8 bg-[#FF385C] shadow-sm"
                  : "w-2 bg-white/70 hover:bg-white"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
