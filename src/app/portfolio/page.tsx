import type { Metadata } from "next";
import Link from "next/link";
import { SiteNavigation } from "@/components/SiteNavigation";
import { PortfolioGallery3D } from "@/components/PortfolioGallery3D";

export const metadata: Metadata = {
  title: "Portfolio — VISYNTH Creative Technology Studio",
  description:
    "Selected work and visual explorations by VISYNTH across 3D animation, branding, graphic design, web and app development, and cybersecurity.",
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between overflow-x-clip">
      {/* 1. Existing Navigation at the Top */}
      <SiteNavigation isPortfolioPage />

      {/* 2. Minimal Heading & Interactive 3D Portfolio Gallery */}
      <main className="flex-1 w-full bg-[#050505]">
        <PortfolioGallery3D />
      </main>

      {/* 3. Compact Footer Consistent with Existing Website */}
      <footer className="w-full max-w-[1440px] mx-auto px-[5.8%] py-6 border-t border-white/[0.1] bg-[#050505] flex flex-col sm:flex-row items-center justify-between gap-4 text-[9.5px] tracking-[0.22em] uppercase text-white/50">
        <span>VISYNTH — CREATIVE TECHNOLOGY STUDIO</span>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="hover:text-white transition-colors focus:outline-none"
          >
            HOME
          </Link>
          <Link
            href="/#contact"
            className="hover:text-white transition-colors focus:outline-none"
          >
            CONTACT
          </Link>
        </div>
      </footer>
    </div>
  );
}

