"use client";

import React from "react";
import Link from "next/link";
import { 
  Zap, 
  Users, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Flame, 
  Trophy,
  Target,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

// Mock live matches data
const LIVE_MATCHES = [
  {
    id: "match-1",
    sport: "Cricket",
    title: "Weekend Cricket Bash",
    venue: "Our Zone Sports Arena",
    address: "D.No: 12-468/E/4, Near Highway",
    distance: "0.16 Kms",
    playersJoined: 8,
    playersNeeded: 2,
    startsIn: "45 min",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800",
    isHot: true,
  },
  {
    id: "match-2",
    sport: "Football",
    title: "5-a-Side Evening Game",
    venue: "The Turf Mumbai",
    address: "Western Express Highway, Goregaon",
    distance: "2.40 Kms",
    playersJoined: 7,
    playersNeeded: 3,
    startsIn: "1 hr 20 min",
    level: "All Levels",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800",
    isHot: true,
  },
  {
    id: "match-3",
    sport: "Badminton",
    title: "Doubles Partner Needed",
    venue: "Sai Sandeep Badminton Club",
    address: "Pappula Mill Rd, Yanam",
    distance: "6.62 Kms",
    playersJoined: 3,
    playersNeeded: 1,
    startsIn: "2 hrs",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1626225967045-944080928956?auto=format&fit=crop&q=80&w=800",
    isHot: false,
  },
  {
    id: "match-4",
    sport: "Football",
    title: "Morning Football League",
    venue: "Elite Football Arena",
    address: "Link Road, Malad West",
    distance: "0.8 Kms",
    playersJoined: 12,
    playersNeeded: 2,
    startsIn: "30 min",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800",
    isHot: true,
  },
  {
    id: "match-5",
    sport: "Cricket",
    title: "Box Cricket Championship",
    venue: "Decathlon Sports Hub",
    address: "No. 11-85 & 183/1, Eluru Rd",
    distance: "9.72 Kms",
    playersJoined: 6,
    playersNeeded: 4,
    startsIn: "3 hrs",
    level: "All Levels",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    isHot: false,
  },
  {
    id: "match-6",
    sport: "Badminton",
    title: "Singles Practice Match",
    venue: "Smashers Shuttle Court",
    address: "Versova Link Road, Andheri",
    distance: "4.5 Kms",
    playersJoined: 1,
    playersNeeded: 1,
    startsIn: "1 hr",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1626225967045-944080928956?auto=format&fit=crop&q=80&w=800",
    isHot: false,
  },
];

interface PlayNowSectionProps {
  city: string;
}

export default function PlayNowSection({ city }: PlayNowSectionProps) {
  return (
    <div className="bg-[#F8F9FA]">
      {/* Hero Banner */}
      <div className="relative overflow-hidden text-white min-h-[360px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/gamehub_promo_banner.png"
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c222b] via-[#1c222b]/80 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="max-w-[1200px] w-full mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase mb-6 shadow-lg shadow-amber-500/20">
              <Zap size={12} className="text-white" />
              LIVE MATCHES
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1] drop-shadow-lg">
              Join matches <span className="text-[#42B460]">instantly</span>
            </h1>
            <p className="text-lg text-white/80 font-medium leading-relaxed mb-8 drop-shadow-md">
              Find players near you and jump into live games. No pre-booking required — just show up and play.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-white/70 text-sm drop-shadow-md">
                <div className="w-2 h-2 rounded-full bg-[#42B460] animate-pulse shadow-[0_0_8px_#42B460]" />
                <span className="font-bold">{LIVE_MATCHES.length} active matches near {city}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: <Users size={20} />, label: "Players Online", value: "42", color: "text-[#42B460]" },
            { icon: <Flame size={20} />, label: "Hot Matches", value: String(LIVE_MATCHES.filter(m => m.isHot).length), color: "text-amber-500" },
            { icon: <Clock size={20} />, label: "Starting Soon", value: "3", color: "text-blue-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`${stat.color} bg-gray-50 p-3 rounded-xl`}>{stat.icon}</div>
              <div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Live Matches Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#1c222b] tracking-tight">Live Matches</h2>
            <p className="text-sm text-gray-400 font-medium mt-1">Join a game happening right now</p>
          </div>
          <div className="flex gap-2">
            {["All", "Cricket", "Football", "Badminton"].map(sport => (
              <button
                key={sport}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                  sport === "All"
                    ? "bg-[#42B460] text-white border-[#42B460]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#42B460] hover:text-[#42B460]"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LIVE_MATCHES.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                {/* Image */}
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={match.image}
                    alt={match.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {match.isHot && (
                      <div className="bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-md flex items-center gap-1 tracking-wider uppercase">
                        <Flame size={10} /> HOT
                      </div>
                    )}
                    <div className="bg-white/90 backdrop-blur-md text-[#1c222b] text-[9px] font-black px-2 py-1 rounded-md tracking-wider uppercase">
                      {match.sport}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Clock size={11} />
                    Starts in {match.startsIn}
                  </div>

                  {/* Player Progress */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-[11px] font-bold">{match.playersJoined}/{match.playersJoined + match.playersNeeded} Players</span>
                        <span className="text-[#42B460] text-[11px] font-black">{match.playersNeeded} spots left</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div
                          className="bg-[#42B460] h-1.5 rounded-full transition-all"
                          style={{ width: `${(match.playersJoined / (match.playersJoined + match.playersNeeded)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-[16px] font-black text-[#1c222b] mb-1 group-hover:text-[#42B460] transition-colors">
                    {match.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400 text-[12px] font-medium mb-3">
                    <MapPin size={12} />
                    {match.venue} · {match.distance}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                        match.level === "Beginner" ? "bg-green-50 text-green-600" :
                        match.level === "Intermediate" ? "bg-blue-50 text-blue-600" :
                        match.level === "Advanced" ? "bg-purple-50 text-purple-600" :
                        "bg-gray-50 text-gray-600"
                      }`}>
                        {match.level}
                      </span>
                    </div>

                    <button className="bg-[#42B460] hover:bg-[#38A354] text-white px-5 py-2.5 rounded-xl text-[12px] font-black transition-all hover:shadow-lg hover:shadow-[#42B460]/20 flex items-center gap-1.5 group/btn">
                      JOIN
                      <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
