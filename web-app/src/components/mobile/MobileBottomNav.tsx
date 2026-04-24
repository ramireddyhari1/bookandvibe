"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Sparkles, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Determine active index: 0=search/events, 1=home, 2=profile
  const getActiveIndex = () => {
    if (pathname === "/") return 1;
    if (pathname?.startsWith("/profile")) return 2;
    return 0; // events, gamehub, tickets, etc.
  };

  const activeIndex = getActiveIndex();

  // Check if we're on gamehub for theming
  const isGameHub = pathname?.includes("/gamehub");

  const navItems = [
    { href: "/events", icon: Search, label: "Explore" },
    { href: "/", icon: Sparkles, label: "Home" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[200] md:hidden">
      <div
        className="relative rounded-[28px] px-2 py-0.5 shadow-2xl"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Active Slider Indicator */}
        <div
          className="absolute top-[6px] h-[calc(100%-12px)] rounded-[22px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            width: "calc(100% / 3 - 4px)",
            left: `calc(${activeIndex} * (100% / 3) + 2px)`,
            background: isGameHub ? "#F0FDF4" : "#fff7ed",
            border: `1px solid ${isGameHub ? "#00A63E" : "#ffedd5"}`,
          }}
        />

        {/* Nav Items */}
        <div className="relative flex items-center h-[60px]">
          {navItems.map((item, idx) => {
            const isActive = activeIndex === idx;
            const Icon = item.icon;

            const activeColor = isGameHub ? "#00A63E" : "#D53F17";
            const inactiveColor = isGameHub ? "rgba(0,166,62,0.3)" : "rgba(213, 63, 23, 0.3)";

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative z-10"
              >
                {idx === 1 ? (
                  /* Center Home button with label */
                  <>
                    <Icon size={24} color={isActive ? activeColor : inactiveColor} strokeWidth={1.8} />
                    <span
                      className="text-[10px] font-bold tracking-wide"
                      style={{ color: isActive ? activeColor : inactiveColor }}
                    >
                      Home
                    </span>
                  </>
                ) : (
                  <Icon size={24} color={isActive ? activeColor : inactiveColor} strokeWidth={2} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
