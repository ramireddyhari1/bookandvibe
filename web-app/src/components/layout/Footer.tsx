import Link from "next/link";
import { Ticket, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-rose-950 border-t border-rose-900/30 text-rose-200">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand & description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <Ticket className="text-rose-500 fill-rose-500 -rotate-45 group-hover:scale-110 transition-transform" size={28} />
              <span className="text-[28px] font-mexicana text-white tracking-widest pt-1">
                BOOK & VIBE
              </span>
            </Link>
            <p className="text-rose-300/80 leading-relaxed max-w-sm mb-6 text-sm font-medium">
              Your ultimate destination for discovering premium events, nightlife, and workshops. Elevate your weekend with experiences that match your vibe.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-rose-900/50 hover:bg-rose-500 w-10 h-10 flex items-center justify-center rounded-full transition-colors text-white font-bold text-xs mt-1">
                FB
              </a>
              <a href="#" className="bg-rose-900/50 hover:bg-rose-500 w-10 h-10 flex items-center justify-center rounded-full transition-colors text-white font-bold text-xs mt-1">
                X
              </a>
              <a href="#" className="bg-rose-900/50 hover:bg-rose-500 w-10 h-10 flex items-center justify-center rounded-full transition-colors text-white font-bold text-xs mt-1">
                IG
              </a>
              <a href="#" className="bg-rose-900/50 hover:bg-rose-500 w-10 h-10 flex items-center justify-center rounded-full transition-colors text-white font-bold text-xs mt-1">
                YT
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px] uppercase tracking-wider">Explore</h4>
            <ul className="space-y-4 text-[14px]">
              <li><Link href="/" className="hover:text-rose-400 transition-colors">Home</Link></li>
              <li><Link href="/events" className="hover:text-rose-400 transition-colors">Concerts & Shows</Link></li>
              <li><Link href="/nearby-top" className="hover:text-rose-400 transition-colors">Nearby Events</Link></li>
              <li><Link href="/gamehub" className="hover:text-rose-400 transition-colors">Gamehub</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px] uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-[14px]">
              <li><Link href="#" className="hover:text-rose-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-rose-400 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-rose-400 transition-colors">Partner with Us</Link></li>
              <li><Link href="#" className="hover:text-rose-400 transition-colors">Press & Media</Link></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-[15px] uppercase tracking-wider">Support</h4>
            <ul className="space-y-4 text-[14px]">
              <li><Link href="#" className="hover:text-rose-400 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-rose-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-rose-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-rose-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-rose-900/40 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-rose-400/60 font-medium">
          <p>&copy; {new Date().getFullYear()} Book & Vibe Technologies. All rights reserved.</p>
          <div className="flex gap-6">
             <span>Made with ❤️ for live events</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
