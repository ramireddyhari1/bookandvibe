"use client";

import React from "react";
import { motion } from "framer-motion";

interface PremiumLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  text?: string;
}

export default function PremiumLoader({ size = "md", color = "#D53F17", text }: PremiumLoaderProps) {
  const dimensions = {
    sm: { w: 24, h: 24, stroke: 2.5 },
    md: { w: 48, h: 48, stroke: 3 },
    lg: { w: 64, h: 64, stroke: 4 },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: dimensions.w, height: dimensions.h }}>
        {/* Outer Ring */}
        <div 
          className="absolute inset-0 rounded-full border-gray-100 border"
          style={{ borderWidth: dimensions.stroke }}
        />
        
        {/* Animated Segment */}
        <motion.div
          className="absolute inset-0 rounded-full border-t-transparent border-l-transparent border-r-transparent"
          style={{ 
            borderWidth: dimensions.stroke, 
            borderColor: color,
            borderTopColor: color 
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Center Dot */}
        <motion.div 
          className="absolute inset-0 m-auto rounded-full"
          style={{ 
            width: dimensions.w / 4, 
            height: dimensions.h / 4, 
            backgroundColor: color 
          }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {text && (
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] font-bold uppercase tracking-widest text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
