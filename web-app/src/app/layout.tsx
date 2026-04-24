import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LocationProvider } from "@/context/LocationContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Book & Vibe | Premium Event Booking",
  description: "Discover and book premium events, concerts, and workshops.",
  verification: {
    google: "KGMElbLglr8ClZPvoFIGTlKK7I0RLuJCUhHJbUrjCUk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="" suppressHydrationWarning>
      <body className={`${inter.className} bg-rose-50 text-slate-900 antialiased`.trim()}>
        <LocationProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
