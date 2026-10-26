import Link from "next/link";
import { SiteNavigation } from "@/components/SiteNavigation";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between overflow-x-clip select-none">
      <SiteNavigation isSubPage />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-[5.8%] flex flex-col items-start justify-center pt-28 pb-20">
        <div
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 75% 35%, rgba(180, 15, 15, 0.16) 0%, rgba(0, 0, 0, 0.8) 70%)",
          }}
        />

        <div className="relative z-10 max-w-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[1px] bg-[#ff1e1e]" aria-hidden="true" />
            <span className="text-[10px] font-mono tracking-[0.32em] uppercase text-[#ff2a2a]">
              ERROR 404 // ROUTE NOT FOUND
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold uppercase tracking-[-0.03em] leading-none text-white">
            PAGE OUT OF{" "}
            <span className="text-[#e61e1e] font-light drop-shadow-[0_0_18px_rgba(255,30,30,0.5)]">
              BOUNDS.
            </span>
          </h1>

          <p className="text-[13.5px] sm:text-[15px] font-light text-[#b8b8b8] leading-relaxed">
            The coordinates you requested do not exist in this sector. Return to the home experience or explore our portfolio gallery.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#e61e1e] hover:bg-[#ff2a2a] text-white text-[10px] font-semibold tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_0_16px_rgba(230,30,30,0.35)] hover:shadow-[0_0_24px_rgba(255,42,42,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
            >
              <span>RETURN HOME</span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2.5 px-5 py-3 border border-white/20 hover:border-[#ff2a2a]/80 bg-white/[0.03] hover:bg-[#ff2a2a]/10 text-white/90 hover:text-white text-[10px] font-medium tracking-[0.22em] uppercase transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a] rounded-sm"
            >
              <span>EXPLORE WORK</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-[1440px] mx-auto px-[5.8%] py-6 border-t border-white/[0.1] bg-[#050505] flex flex-col sm:flex-row items-center justify-between gap-4 text-[9.5px] tracking-[0.22em] uppercase text-white/50">
        <span>VISYNTH — CREATIVE TECHNOLOGY STUDIO</span>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70"
          >
            HOME
          </Link>
          <Link
            href="/portfolio"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70"
          >
            PORTFOLIO
          </Link>
          <Link
            href="/#contact"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70"
          >
            CONTACT
          </Link>
        </div>
      </footer>
    </div>
  );
}

