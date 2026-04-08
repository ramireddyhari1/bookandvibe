"use client";

import React from "react";
import { Users, Calendar, MapPin } from "lucide-react";

interface SubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "play", label: "Play Now", icon: Users },
    { id: "reserve", label: "Reserve Slot", icon: Calendar },
    { id: "find", label: "Find Grounds", icon: MapPin },
  ];

  const activeIndex = menuItems.findIndex((item) => item.id === activeTab);

  return (
    <div className="sticky top-[80px] z-[90] w-full bg-white/60 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-8 flex justify-center">
        {/* Premium Segmented Control Container */}
        <div className="relative flex w-full max-w-[600px] bg-[#F5F5F5] p-1.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-gray-100/50">

          {/* Animated Slider Pill */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-[#42B460] to-[#38A354] shadow-[0_2px_8px_rgba(66,180,96,0.25)] transition-all duration-300 ease-in-out z-0"
            style={{
              width: `calc(33.33% - 8px)`,
              left: `calc(${(activeIndex * 33.33)}% + 4px)`
            }}
          />

          {/* Navigation Buttons */}
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  relative z-10 flex-1 flex items-center justify-center gap-2.5 py-3 md:py-3.5 px-2 rounded-full transition-all duration-300
                  ${isActive ? "text-white" : "text-gray-500 hover:text-gray-900"}
                  group
                `}
              >
                <div className={`transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[13px] md:text-[14px] font-bold tracking-widest transition-all uppercase`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubNav;
