"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isGamehub = pathname?.includes("/gamehub");

  const theme = {
    bg: isGamehub ? "bg-[#111827] border-gray-800" : "bg-rose-950 border-rose-900/30",
    textMain: isGamehub ? "text-gray-300" : "text-rose-200",
    textMuted: isGamehub ? "text-gray-400/80" : "text-rose-300/80",
    logoIcon: isGamehub ? "text-[#42B460] fill-[#42B460]" : "text-rose-500 fill-rose-500",
    socialBg: isGamehub ? "bg-gray-800 hover:bg-[#42B460]" : "bg-rose-900/50 hover:bg-rose-500",
    linkHover: isGamehub ? "hover:text-[#42B460]" : "hover:text-rose-400",
    bottomBorder: isGamehub ? "border-gray-800" : "border-rose-900/40",
    bottomText: isGamehub ? "text-gray-500" : "text-rose-400/60"
  };

  return (
    <footer className={`${theme.bg} border-t ${theme.textMain} transition-colors duration-500 hidden md:block`}>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pt-16 pb-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand & description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <Ticket className={`${theme.logoIcon} -rotate-45 group-hover:scale-110 transition-transform`} size={36} />
              <span className="text-[36px] font-mexicana text-white tracking-widest pt-1 leading-none">
                BOOK & VIBE
              </span>
            </Link>
            <p className={`${theme.textMuted} leading-relaxed max-w-sm mb-6 text-sm font-medium`}>
              Your ultimate destination for discovering premium events, nightlife, and workshops. Elevate your weekend with experiences that match your vibe.
            </p>
            <div className="flex gap-4">
              {['FB', 'X', 'IG', 'YT'].map((social) => (
                <a key={social} href="#" className={`${theme.socialBg} w-10 h-10 flex items-center justify-center rounded-full transition-colors text-white font-bold text-xs mt-1`}>
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px] uppercase tracking-wider">Explore</h4>
            <ul className="space-y-4 text-[14px]">
              <li><Link href="/" className={`${theme.linkHover} transition-colors`}>Home</Link></li>
              <li><Link href="/events" className={`${theme.linkHover} transition-colors`}>Concerts & Shows</Link></li>
              <li><Link href="/nearby-top" className={`${theme.linkHover} transition-colors`}>Nearby Events</Link></li>
              <li><Link href="/gamehub" className={`${theme.linkHover} transition-colors`}>Gamehub</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px] uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-[14px]">
              <li><Link href="#" className={`${theme.linkHover} transition-colors`}>About Us</Link></li>
              <li><Link href="#" className={`${theme.linkHover} transition-colors`}>Careers</Link></li>
              <li><Link href="#" className={`${theme.linkHover} transition-colors`}>Partner with Us</Link></li>
              <li><Link href="#" className={`${theme.linkHover} transition-colors`}>Press & Media</Link></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px] uppercase tracking-wider">Support</h4>
            <ul className="space-y-4 text-[14px]">
              <li><Link href="#" className={`${theme.linkHover} transition-colors`}>Help Center</Link></li>
              <li><Link href="#" className={`${theme.linkHover} transition-colors`}>Terms of Service</Link></li>
              <li><Link href="#" className={`${theme.linkHover} transition-colors`}>Privacy Policy</Link></li>
              <li><Link href="#" className={`${theme.linkHover} transition-colors`}>Contact Us</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className={`pt-8 border-t ${theme.bottomBorder} flex flex-col md:flex-row items-center justify-between gap-4 text-sm ${theme.bottomText} font-medium`}>
          <p>&copy; {new Date().getFullYear()} Book & Vibe Technologies. All rights reserved.</p>
          <div className="flex gap-6">
             <span>Made with ❤️ for live events</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
