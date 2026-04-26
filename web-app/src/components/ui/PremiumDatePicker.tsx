"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumDatePickerProps {
  label: string;
  value: string; // ISO Date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function PremiumDatePicker({
  label,
  value,
  onChange,
  className = ""
}: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Current view state (what month the user is looking at)
  const [viewDate, setViewDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  const selectedDate = useMemo(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  // Close on Outside Click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync viewDate when value changes externally (if closed)
  useEffect(() => {
    if (!isOpen && value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setViewDate(d);
    }
  }, [value, isOpen]);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format to YYYY-MM-DD local
    const offset = newDate.getTimezoneOffset();
    const formattedDate = new Date(newDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewDate.getFullYear() &&
           selectedDate.getMonth() === viewDate.getMonth() &&
           selectedDate.getDate() === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === viewDate.getFullYear() &&
           today.getMonth() === viewDate.getMonth() &&
           today.getDate() === day;
  };

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = startDayOfMonth(year, month);
    
    // Previous month filler
    const prevMonthDays = daysInMonth(year, month - 1);
    const fillers = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      fillers.push(
        <div key={`fill-${i}`} className="h-9 w-9 flex items-center justify-center text-gray-600 text-[13px] font-medium opacity-30">
          {prevMonthDays - i}
        </div>
      );
    }

    const dayNodes = [];
    for (let d = 1; d <= totalDays; d++) {
      const active = isSelected(d);
      const current = isToday(d);
      
      dayNodes.push(
        <button
          key={d}
          onClick={() => handleDateSelect(d)}
          className={`h-9 w-9 rounded-xl flex items-center justify-center text-[13px] font-bold transition-all ${
            active 
              ? "bg-[#42B460] text-white shadow-lg shadow-[#42B460]/20 scale-110" 
              : current 
                ? "text-[#42B460] hover:bg-white/10" 
                : "text-white/80 hover:bg-white/10"
          }`}
        >
          {d}
        </button>
      );
    }

    return [...fillers, ...dayNodes];
  };

  // Format Display Date (e.g., April 09, 2026)
  const displayDate = selectedDate 
    ? selectedDate.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
    : "Select date";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block mb-2 px-1">
        {label}
      </label>
      
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white/5 border ${isOpen ? 'border-[#42B460]' : 'border-white/10'} rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-white/10 group text-left`}
      >
        <span className={`font-bold text-[15px] ${selectedDate ? 'text-white' : 'text-gray-500'}`}>
          {displayDate}
        </span>
        <CalendarIcon 
          size={18} 
          className={isOpen ? 'text-[#42B460]' : 'text-[#42B460]/70 group-hover:text-[#42B460] transition-colors'} 
        />
      </button>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-3 bg-[#1c222b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[100] p-5 backdrop-blur-xl"
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{viewDate.getFullYear()}</span>
                <span className="text-white text-[17px] font-bold">{MONTHS[viewDate.getMonth()]}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className="h-9 w-9 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">
                  {day}
                </div>
              ))}
              {renderDays()}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
               <button 
                 onClick={() => {
                   const today = new Date().toISOString().split('T')[0];
                   onChange(today);
                   setIsOpen(false);
                 }}
                 className="text-[11px] font-bold text-[#42B460] hover:text-[#42B460]/80 uppercase tracking-wider px-2 transition-colors"
               >
                 Today
               </button>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-wider px-2 transition-colors"
               >
                 Close
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
