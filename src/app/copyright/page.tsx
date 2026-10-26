import type { Metadata } from "next";
import Link from "next/link";
import { SiteNavigation } from "@/components/SiteNavigation";

export const metadata: Metadata = {
  title: "Copyright & Intellectual Property — VISYNTH",
  description:
    "Copyright and intellectual property notice for VISYNTH Creative Technology Studio covering branding, design, 3D animations, code, and portfolio assets.",
  alternates: {
    canonical: "/copyright",
  },
};

const COPYRIGHT_SECTIONS = [
  {
    code: "01",
    title: "Ownership of Studio Assets & Content",
    body: [
      "Unless otherwise stated or explicitly credited, VISYNTH Creative Technology Studio owns all rights, title, and interest in and to the VISYNTH brand identity, logos, wordmarks, written content, website design, source code, shaders, interactive sequences, graphics, 3D renders, animations, and portfolio presentation displayed on this website.",
      "All visual works, interactive architectures, and creative direction showcased across this platform are protected by applicable domestic and international copyright, trademark, and intellectual property laws.",
    ],
  },
  {
    code: "02",
    title: "Prohibited Uses & Restrictions",
    body: [
      "Visitors and third parties may not copy, reproduce, republish, upload, post, frame, modify, create derivative works from, sell, license, scrape, harvest, or redistribute any content, imagery, 3D sequences, animations, or code from this website without prior written permission from VISYNTH.",
      "Automated extraction, data mining, or use of VISYNTH visual assets, renders, or written materials for training machine learning models or commercial redistribution is strictly prohibited.",
    ],
  },
  {
    code: "03",
    title: "Third-Party Trademarks & Credited Works",
    body: [
      "VISYNTH respects the intellectual property rights of others. Any third-party trademarks, product names, client marks, open-source software libraries, or separately credited creative assets referenced or integrated within this website remain the property of their respective owners and are governed by their applicable licenses or agreements.",
    ],
  },
  {
    code: "04",
    title: "Requesting Permissions & Licensing",
    body: [
      "If you wish to request permission to feature, reference, press-publish, or license any VISYNTH creative work, case study material, or visual asset, please submit a detailed inquiry through our website Contact form or reach out via our official WhatsApp channel.",
      "Any granted permission must be confirmed in writing by an authorized representative of VISYNTH and used strictly within the agreed scope.",
    ],
  },
];

export default function CopyrightPage() {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between overflow-x-clip">
      <SiteNavigation isSubPage />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-[5.8%] pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Subtle atmospheric glow */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 82% 18%, rgba(165, 16, 16, 0.14) 0%, rgba(75, 5, 5, 0.05) 45%, rgba(0, 0, 0, 0) 75%)",
          }}
        />

        <div className="relative z-10 max-w-[920px]">
          {/* Header Block */}
          <div className="border-b border-white/[0.12] pb-8 md:pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-[1px] bg-[#ff1e1e]" />
                <span className="text-[10.5px] font-medium tracking-[0.34em] uppercase text-[#ff2a2a]">
                  LEGAL // INTELLECTUAL PROPERTY
                </span>
              </div>
              <span className="text-[10px] tracking-[0.24em] uppercase text-white/55 font-mono">
                © 2026 VISYNTH. ALL RIGHTS RESERVED.
              </span>
            </div>

            <h1 className="font-display font-bold uppercase text-white text-[clamp(2rem,4.6vw,3.9rem)] leading-[0.95] tracking-[-0.03em] mb-4">
              COPYRIGHT NOTICE.
            </h1>

            <p className="text-[#c8c8c8] text-[13.5px] md:text-[15px] leading-[1.68] font-light max-w-[680px]">
              Intellectual property ownership, usage restrictions, and licensing
              terms governing all creative and technical works presented by
              VISYNTH.
            </p>
          </div>

          {/* Copyright Sections */}
          <div className="divide-y divide-white/[0.09]">
            {COPYRIGHT_SECTIONS.map((section) => (
              <section
                key={section.code}
                className="py-7 md:py-9 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start"
              >
                <div className="md:col-span-4 flex items-baseline gap-3">
                  <span className="text-[10px] font-mono tracking-[0.22em] text-[#ff2a2a]">
                    {section.code}
                  </span>
                  <h2 className="font-display text-[13px] md:text-[14px] font-semibold tracking-[0.14em] uppercase text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="md:col-span-8 space-y-3.5">
                  {section.body.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-[#bdbdbd] text-[13px] md:text-[14px] leading-[1.72] font-light"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Formal Notice Callout & Action Bar */}
          <div className="mt-8 pt-8 border-t border-white/[0.14] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="font-display text-[12px] tracking-[0.22em] uppercase text-white font-semibold mb-1">
                © 2026 VISYNTH. All rights reserved.
              </p>
              <p className="text-[12.5px] text-[#b8b8b8] font-light">
                For permissions, press inquiries, or licensing requests, contact
                the studio directly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-3 border border-[#ff1e1e]/60 bg-[#ff1e1e]/[0.1] hover:bg-[#ff1e1e]/[0.2] hover:border-[#ff3b3b] px-5 py-2.5 text-[10px] tracking-[0.24em] uppercase font-medium text-white transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a]"
              >
                <span>REQUEST PERMISSION</span>
                <span aria-hidden="true" className="text-[#ff3b3b]">
                  →
                </span>
              </Link>

              <a
                href="https://wa.me/923161108514?text=Hello%20VISYNTH%2C%20I%20would%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message VISYNTH on WhatsApp (opens in a new tab)"
                className="inline-flex items-center gap-2.5 border border-white/[0.2] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/[0.4] px-5 py-2.5 text-[10px] tracking-[0.24em] uppercase font-medium text-white/90 hover:text-white transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a]"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a]"
                  aria-hidden="true"
                />
                <span>WHATSAPP</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-[1440px] mx-auto px-[5.8%] py-6 border-t border-white/[0.1] bg-[#050505] flex flex-col md:flex-row items-center justify-between gap-4 text-[9.5px] tracking-[0.22em] uppercase text-white/50">
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
            href="/portfolio"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm px-1"
          >
            PORTFOLIO
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
        </div>
      </footer>
    </div>
  );
}

