"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";

interface WebsiteConfig {
  footerText?: string;
  socialLinks?: { platform: string; url: string }[];
}

export default function Footer() {
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | null>(null);

  useEffect(() => {
    fetchApi('/config/website')
      .then(res => {
        if (res.data) setWebsiteConfig(res.data as WebsiteConfig);
      })
      .catch(console.error);
  }, []);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isGamehub = pathname?.includes("/gamehub");
  const isEvents = pathname?.includes("/events");

  if (isHome) return null;

  const theme = {
    bg: "bg-[#171819]",
    textMain: "text-white",
    textMuted: "text-white/85",
    iconHover: isGamehub ? "hover:text-[#42B460]" : isEvents ? "hover:text-orange-400" : "hover:text-rose-400",
    accentText: isGamehub ? "text-[#42B460]" : isEvents ? "text-orange-400" : "text-rose-400",
    accentRule: isGamehub ? "bg-[#42B460]" : isEvents ? "bg-orange-400" : "bg-rose-400",
    logoSrc: isGamehub ? "/bv-green.png" : isEvents ? "/bv-orange.png" : "/bv-white.png",
  };

  const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
    Facebook: FaFacebookF,
    Twitter: FaTwitter,
    Instagram: FaInstagram,
    YouTube: FaYoutube,
    Pinterest: FaPinterestP,
  };

  const socialLinks = websiteConfig?.socialLinks?.length > 0 ? websiteConfig.socialLinks : [
    { platform: "Facebook", url: "#" },
    { platform: "Twitter", url: "#" },
    { platform: "Instagram", url: "#" },
    { platform: "YouTube", url: "#" },
    { platform: "Pinterest", url: "#" },
  ];

  const footerText = websiteConfig?.footerText || "Book & Vibe helps you discover experiences at the best value in your city. From headline events to game nights, every booking is designed to feel seamless, reliable and worth sharing.";

  return (
    <footer className={`${theme.bg} ${theme.textMain} hidden md:block`}>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5">
        <div className={`h-px w-full mb-5 ${theme.accentRule} opacity-55`} />
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-6 mb-3 text-[24px]">
            {socialLinks.map(({ platform, url }) => {
              const Icon = iconMap[platform] || FaFacebookF;
              return (
                <a
                  key={platform}
                  href={url}
                  aria-label={platform}
                  className={`${theme.iconHover} inline-flex items-center justify-center text-white transition-transform duration-300 hover:-translate-y-0.5`}
                >
                  <Icon size={22} />
                </a>
              );
            })}
          </div>

          <p className={`${theme.textMuted} text-[15px] leading-6 max-w-4xl mx-auto mb-2`}>
            {footerText}
          </p>

          <Link href="/" className="inline-flex justify-center -mt-2 mb-1">
            <img
              src={theme.logoSrc}
              alt="Book & Vibe"
              className="h-28 w-auto"
            />
          </Link>

          <div className="text-[14px] font-normal mb-2">
            <span className="text-white">India</span>
            <span className={`mx-2 ${theme.accentText}`}>|</span>
            <span className={theme.accentText}>INR</span>
          </div>

          <div className="text-[12px] text-white/55">
            &copy; {new Date().getFullYear()} Book & Vibe Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
