"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, Zap, AlertCircle } from "lucide-react";

interface PricingRule {
  type: string;
  time?: string;
  day?: string;
  price: number;
}

interface PriceChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: string;
  basePrice: number;
  unit: string;
  pricingRules: PricingRule[];
}

export default function PriceChartModal({
  isOpen,
  onClose,
  sport,
  basePrice,
  unit,
  pricingRules = []
}: PriceChartModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#1c222b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#42B460] to-transparent opacity-50" />
              <div>
                <span className="text-[#42B460] text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">Pricing Analysis</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{sport} Chart</h3>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 pt-0">
              <div className="space-y-4">
                {/* Base Price Card */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:border-[#42B460]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#42B460]/10 flex items-center justify-center text-[#42B460]">
                      <Zap size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Base Rate</p>
                      <p className="text-white font-black">Normal Hours</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">₹{basePrice}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">PER {unit.toUpperCase()}</p>
                  </div>
                </div>

                {/* Pricing Tiers Section */}
                <div className="pt-4">
                  <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest mb-4 px-1">Dynamic Rates & Tiers</p>
                  <div className="space-y-3">
                    {pricingRules.length > 0 ? (
                      pricingRules.map((rule, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          key={idx} 
                          className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              rule.type === 'PEAK' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {rule.type === 'PEAK' ? <Clock size={16} /> : <Calendar size={16} />}
                            </div>
                            <div>
                              <p className="text-white text-xs font-black uppercase tracking-wide">{rule.type} RATE</p>
                              <p className="text-gray-500 text-[10px] font-bold">{rule.time || rule.day || 'Special Schedule'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-[#42B460]">₹{rule.price}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                        <AlertCircle className="mx-auto text-gray-600 mb-2" size={24} />
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                          No special pricing rules active for this venue. <br/>Fixed base rate applies at all times.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-8 bg-[#42B460]/5 border border-[#42B460]/10 p-4 rounded-2xl">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-[#42B460]">
                    <AlertCircle size={16} />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    Pricing is managed directly by <span className="text-white font-bold">Venue Partners</span>. Final price may include minimal platform service fees and taxes as applicable during checkout.
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full mt-6 bg-[#42B460] hover:bg-[#38A354] text-white py-4 rounded-2xl font-black text-[13px] uppercase tracking-wider transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                Understood, Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
