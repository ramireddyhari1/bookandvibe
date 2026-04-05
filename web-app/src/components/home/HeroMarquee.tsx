"use client";
import { motion } from "framer-motion";

const IMAGES = [
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600",
  "https://images.unsplash.com/photo-1540039155732-613d2fbc147a?q=80&w=600",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=600",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600",
  "https://images.unsplash.com/photo-1470229722913-7c090be5f524?q=80&w=600",
  "https://images.unsplash.com/photo-1533174000273-d1c92a2a7aa0?q=80&w=600",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600",
];

export default function HeroMarquee() {
  // We duplicate the images so the marquee can scroll seamlessly to 50% of its width.
  const marqueeImages = [...IMAGES, ...IMAGES];

  return (
    <div className="relative w-full overflow-hidden mt-8 md:mt-16 py-10 flex items-center justify-center min-h-[400px]">
      
      {/* 
        Radial gradient mask to make outer posters look faded/farther away
        creating a subtle 3D curved illusion like the design
      */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(224, 242, 254, 1) 0%, rgba(224, 242, 254, 0) 15%, rgba(224, 242, 254, 0) 85%, rgba(248, 250, 252, 1) 100%)'
        }}
      />

      <motion.div 
        className="flex gap-6 md:gap-8 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 35, repeat: Infinity }}
      >
        {marqueeImages.map((src, i) => {
          // Staggered heights and tilt to mimic the curved/dynamic vibe
          // Outer images in the original are slightly tilted. We can simulate it
          // by rotating alternating items or giving them dynamic margins.
          const isEven = i % 2 === 0;
          
          return (
            <div 
              key={i} 
              className={`
                relative flex-shrink-0 overflow-hidden shadow-2xl rounded-[32px] 
                transition-transform duration-500 hover:scale-105 cursor-pointer
                ${isEven 
                  ? 'w-[200px] sm:w-[240px] md:w-[280px] h-[280px] sm:h-[340px] md:h-[400px] mt-4 rotate-[1deg]' 
                  : 'w-[180px] sm:w-[220px] md:w-[260px] h-[260px] sm:h-[300px] md:h-[360px] -mt-8 -rotate-[2deg]'
                }
              `}
            >
              <img 
                src={src} 
                alt="Event poster" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
