'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white via-blue-50 to-white">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            opacity: 0
          },
          particles: {
            color: {
              value: "#6366f1"
            },
            links: {
              color: "#6366f1",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1
            },
            move: {
              enable: true,
              speed: 1
            },
            number: {
              value: 50
            },
            opacity: {
              value: 0.3
            },
            size: {
              value: { min: 1, max: 3 }
            }
          }
        }}
      />

      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-16 w-full"
          >
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-geist-sans font-light tracking-tight text-gray-900">
                AI has formed
                <motion.span 
                  className="block mt-2 font-normal bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  an opinion about your product
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-500 font-light mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Would you like to know what it is?
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="w-full max-w-2xl mx-auto group"
            >
              <div className="relative">
                {/* Elegant glow effect */}
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 
                            group-hover:opacity-5 blur-xl transition-all duration-700"
                  animate={{
                    scale: isInputFocused ? 1.02 : 1,
                    opacity: isInputFocused ? 0.1 : 0,
                  }}
                  transition={{ duration: 0.7 }}
                />
                
                <div className="relative flex items-center">
                  <Input
                    placeholder="Enter your product URL"
                    className="w-full px-8 py-8 text-xl bg-white/50 border-gray-200 rounded-xl
                             focus:ring-2 focus:ring-blue-500/20 transition-all duration-300
                             hover:bg-white/80 backdrop-blur-sm"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="absolute right-3 flex items-center justify-center px-6 py-3 
                             bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white
                             hover:from-blue-500 hover:to-purple-500 transition-all duration-300
                             shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                  >
                    <span className="mr-2">Reveal</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
