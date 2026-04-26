"use client";

import { motion } from "framer-motion";

interface PremiumLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  text?: string;
}

export default function PremiumLoader({ 
  size = "md", 
  color = "#D53F17", 
  text 
}: PremiumLoaderProps) {
  const dimensions = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const dotSize = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2.5 h-2.5"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className={`relative ${dimensions[size]}`}>
        {/* Animated Rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [0.8, 1.5 + (i * 0.2)],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Central Pulsing Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className={`${dotSize[size]} rounded-full shadow-lg`}
            style={{ backgroundColor: color }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Orbiting Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-current opacity-20"
          style={{ color: color }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-500"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
