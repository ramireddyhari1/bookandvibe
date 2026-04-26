"use client";

import React from "react";
import { Users, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="sticky top-[112px] z-[80] w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-10">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  relative flex items-center gap-2.5 py-6 transition-all duration-300 group
                  ${isActive ? "text-[#1c222b]" : "text-gray-400 hover:text-gray-600"}
                `}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#42B460]" : ""} />
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-bold tracking-tight uppercase">
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="activeSubTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#42B460]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubNav;
