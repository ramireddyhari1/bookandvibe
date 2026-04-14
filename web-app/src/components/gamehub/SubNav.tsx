"use client";

import React from "react";
import { Users, Calendar, MapPin } from "lucide-react";

interface SubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { 
      id: "play", 
      label: "PLAY NOW", 
      subLabel: "Join matches instantly",
      badge: "LIVE",
      icon: Users 
    },
    { 
      id: "reserve", 
      label: "RESERVE SLOT", 
      subLabel: "Book your slot in seconds",
      badge: "POPULAR",
      icon: Calendar 
    },
    { 
      id: "find", 
      label: "FIND GROUNDS", 
      subLabel: "Find grounds near you",
      badge: "NEARBY",
      icon: MapPin 
    },
  ];

  return (
    <div className="sticky top-[80px] z-[90] w-full bg-white/60 backdrop-blur-xl border-b border-gray-100 flex justify-center">
      <div className="max-w-[1200px] w-full px-4 py-6 md:py-10 flex justify-center">
        {/* Premium Pill Container */}
        <div className="inline-flex bg-white rounded-[40px] shadow-2xl border border-gray-100 p-1.5 md:p-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  relative flex items-center gap-3.5 px-6 md:px-8 py-4 rounded-[32px] transition-all duration-300 group
                  ${isActive 
                    ? "bg-[#42B460] text-white shadow-lg shadow-[#42B460]/20 scale-[1.02] z-10" 
                    : "text-[#64748B] hover:text-[#1c222b] hover:bg-gray-50"}
                `}
              >
                 {/* Micro Badge */}
                 <div className={`
                   absolute top-1 right-3 px-1.5 py-0.5 rounded-md text-[7px] font-black tracking-widest uppercase
                   ${isActive 
                     ? "bg-white/90 text-[#42B460] shadow-sm" 
                     : "bg-gray-100 text-gray-500 group-hover:bg-[#42B460] group-hover:text-white transition-colors"}
                 `}>
                   {item.badge}
                 </div>

                <div className={`
                  p-2 rounded-xl transition-colors
                  ${isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-[#42B460]/10"}
                `}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[14px] font-black tracking-tight leading-none">
                    {item.label}
                  </span>
                  <span className={`
                    text-[10px] font-bold whitespace-nowrap leading-none transition-colors
                    ${isActive ? "text-white/80" : "text-gray-400 group-hover:text-gray-500"}
                  `}>
                    {item.subLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubNav;
