import type { Metadata } from "next";
import Link from "next/link";
import { SiteNavigation } from "@/components/SiteNavigation";
import { PortfolioGallery3D } from "@/components/PortfolioGallery3D";
import { StudioProcessSection } from "@/components/StudioProcessSection";

export const metadata: Metadata = {
  title: "Portfolio — VISYNTH Creative Technology Studio",
  description:
    "Selected work and visual explorations by VISYNTH across 3D animation, branding, graphic design, web and app development, and cybersecurity.",
  alternates: {
    canonical: "/portfolio",
  },
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between overflow-x-clip">
      {/* 1. Existing Navigation at the Top */}
      <SiteNavigation isPortfolioPage />

      {/* 2. Interactive 3D Portfolio Gallery & Studio Process */}
      <main className="flex-1 w-full bg-[#050505]">
        <PortfolioGallery3D />
        <StudioProcessSection />
      </main>

      {/* 3. Compact Footer Consistent with Existing Website */}
      <footer className="w-full max-w-[1440px] mx-auto px-[5.8%] py-6 border-t border-white/[0.1] bg-[#050505] flex flex-col md:flex-row items-center justify-between gap-4 text-[9.5px] tracking-[0.22em] uppercase text-white/50">
        <span className="text-center md:text-left">
          VISYNTH — CREATIVE TECHNOLOGY STUDIO
        </span>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2.5">
          <Link
            href="/"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm px-1"
          >
            HOME
          </Link>
          <Link
            href="/#contact"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm px-1"
          >
            CONTACT
          </Link>
          <a
            href="https://wa.me/923161108514?text=Hello%20VISYNTH%2C%20I%20would%20like%20to%20discuss%20a%20project."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message VISYNTH on WhatsApp (opens in a new tab)"
            className="hover:text-[#ff4040] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm px-1"
          >
            WHATSAPP
          </a>
          <a
            href="https://www.instagram.com/visynth.official/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit VISYNTH on Instagram @visynth.official (opens in a new tab)"
            className="hover:text-[#ff4040] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm px-1"
          >
            INSTAGRAM
          </a>
          <Link
            href="/privacy-policy"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm px-1"
          >
            PRIVACY POLICY
          </Link>
          <Link
            href="/copyright"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm px-1"
          >
            COPYRIGHT
          </Link>
        </div>
      </footer>
    </div>
  );
}

