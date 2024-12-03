'use client';

import * as React from "react";
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const mockCompanies = [
  {
    name: "TechnoStuck Corp",
    tagline: "Still using Excel for AI predictions",
    emoji: "🤖",
    color: "from-blue-500/20 to-purple-500/20",
    image: "/images/1.png",
  },
  {
    name: "Analog Forever Ltd",
    tagline: "Because who needs digital transformation?",
    emoji: "📠",
    color: "from-purple-500/20 to-pink-500/20",
    image: "/images/2.svg.png",
  },
  {
    name: "Manual Analytics Inc",
    tagline: "Proudly counting beans since 1985",
    emoji: "🧮",
    color: "from-pink-500/20 to-red-500/20",
    image: "/images/3.svg",
  },
  {
    name: "AI? No Way! Solutions",
    tagline: "We trust our gut, not algorithms",
    emoji: "🔮",
    color: "from-red-500/20 to-orange-500/20",
    image: "/images/4.svg.png",
  },
  {
    name: "Dinosaur Data LLC",
    tagline: "Extinct methods, modern problems",
    emoji: "🦖",
    color: "from-orange-500/20 to-yellow-500/20",
    image: "/images/5.svg",
  },
  {
    name: "Legacy Systems Co",
    tagline: "If it ain't broke, don't upgrade it",
    emoji: "🏛️",
    color: "from-yellow-500/20 to-green-500/20",
    image: "/images/6.svg.png",
  },
  {
    name: "Anti-Innovation Inc",
    tagline: "Proudly resisting change since 1982",
    emoji: "🚫",
    color: "from-green-500/20 to-teal-500/20",
    image: "/images/7.svg.png",
  },
  {
    name: "Manual Override Ltd",
    tagline: "Humans > Machines (we think)",
    emoji: "🔧",
    color: "from-teal-500/20 to-cyan-500/20",
    image: "/images/8.svg.png",
  },
  {
    name: "Traditional Tech Ltd",
    tagline: "Innovation? We'll think about it tomorrow",
    emoji: "📱",
    color: "from-blue-500/20 to-indigo-500/20",
    image: "/images/9.svg",
  }
];

export function SarcasticCarousel() {
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      skipSnaps: false,
      align: 'start'
    },
    [
      AutoScroll({ 
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        playOnInit: true,
        rootNode: (emblaRoot) => emblaRoot.parentElement,
      })
    ]
  );

  return (
    <div className="w-full px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-0 mt-4"
      >
        <h2 className="text-base md:text-lg font-light tracking-wide text-gray-500 italic flex items-center justify-center gap-2">
          <span>Those are companies who{" "}</span>
          <span className="font-medium text-gray-600">don't know</span>
          <span>{" "}what AI thinks about them</span>
          <span className="ml-2" aria-hidden="true">🤫</span>
        </h2>
      </motion.div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex backface-hidden touch-pan-y">
          {[...mockCompanies, ...mockCompanies].map((company, index) => (
            <div 
              key={index} 
              className="relative flex-[0_0_100%] min-w-0 md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
              style={{ 
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-0"
              >
                <Card className="border-0 overflow-hidden relative group bg-transparent shadow-none">
                  <CardContent className="relative aspect-[16/6] p-0">
                    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                      <div className="relative w-64 h-24">
                        <Image
                          src={company.image}
                          alt={company.name}
                          fill
                          className="object-contain opacity-40 transition-all duration-300 group-hover:opacity-60 [filter:grayscale(100%)_brightness(1.2)]"
                          priority={index < 2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 