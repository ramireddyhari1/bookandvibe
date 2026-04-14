"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  price?: number;
  unit?: string;
}

interface PremiumSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function PremiumSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select option",
  icon,
  className = "",
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2 px-1">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white/5 border ${
          isOpen ? "border-[#42B460] shadow-[0_0_15px_rgba(66,180,96,0.1)]" : "border-white/10"
        } rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:bg-white/10 text-left group`}
      >
        <div className="flex items-center justify-between flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`flex-shrink-0 transition-colors duration-300 ${isOpen ? "text-[#42B460]" : "text-gray-400 group-hover:text-[#42B460]"}`}>
              {selectedOption?.icon || icon}
            </div>
            <span className={`text-sm font-bold truncate ${selectedOption ? "text-white" : "text-gray-500"}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          {selectedOption?.price !== undefined && (
            <span className="text-[#42B460] font-black text-xs ml-auto whitespace-nowrap">
              ₹{selectedOption.price}{selectedOption.unit ? `/${selectedOption.unit}` : ""}
            </span>
          )}
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-500 transition-transform duration-500 ${isOpen ? "rotate-180 text-[#42B460]" : ""}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 right-0 z-[200] bg-[#1c222b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden mt-1 p-2"
          >
            <div className="max-h-[250px] overflow-y-auto scrollbar-hide py-1">
              {options.map((option, idx) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mb-1 last:mb-0 group ${
                    option.disabled 
                      ? "opacity-40 cursor-not-allowed" 
                      : value === option.value 
                        ? "bg-[#42B460] text-white" 
                        : "hover:bg-white/5 text-gray-300 hover:text-white"
                  }`}
                >
                  <div className={`transition-colors ${value === option.value ? "text-white" : "text-[#42B460] group-hover:scale-110 transition-transform"}`}>
                    {option.icon}
                  </div>
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-bold truncate w-full">{option.label}</span>
                      {option.disabled && <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Sold Out</span>}
                    </div>
                    {option.price !== undefined && (
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className={`font-black text-sm ${value === option.value ? "text-white/90" : "text-[#42B460]"}`}>
                          ₹{option.price}
                        </span>
                        {option.unit && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${value === option.value ? "text-white/60" : "text-gray-500"}`}>
                            per {option.unit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
