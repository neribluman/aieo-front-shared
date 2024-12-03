'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { SarcasticCarousel } from "./landing-page/components/SarcasticCarousel";

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <main className="h-screen relative overflow-hidden bg-gradient-to-b from-white via-blue-50 to-white">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      
      {/* Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-radial from-blue-400/10 to-transparent blur-3xl"
          animate={{
            x: ['-10%', '10%'],
            y: ['-10%', '10%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          style={{ top: '20%', left: '60%' }}
        />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-12 w-full"
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

        {/* Carousel Section */}
        <div className="mb-8">
          <SarcasticCarousel />
        </div>
      </div>
    </main>
  );
}
