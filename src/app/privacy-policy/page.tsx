import type { Metadata } from "next";
import Link from "next/link";
import { SiteNavigation } from "@/components/SiteNavigation";

export const metadata: Metadata = {
  title: "Privacy Policy — VISYNTH Creative Technology Studio",
  description:
    "Privacy Policy for VISYNTH Creative Technology Studio detailing inquiry data collection, form processing, security, retention, and visitor rights.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const POLICY_SECTIONS = [
  {
    code: "01",
    title: "Information We Collect",
    body: [
      "When you submit an inquiry through the VISYNTH website contact form, we collect only the information you voluntarily provide: your name, your email address, any creative or technical services/disciplines you select (such as Web & App Development, 3D Animation, Branding, Graphic Design, or Cyber Security), and your project brief or message.",
      "To protect our inquiry channel against automated spam, the contact form also includes a standard hidden anti-bot verification check.",
    ],
  },
  {
    code: "02",
    title: "How We Use Your Information",
    body: [
      "Information submitted through our contact form is used exclusively to review and respond to your inquiry, evaluate potential project requirements, provide project proposals or estimates, and communicate with you regarding requested services.",
      "We do not use inquiry submissions for unsolicited mass marketing lists.",
    ],
  },
  {
    code: "03",
    title: "Form Processing & Third-Party Service Providers",
    body: [
      "Contact form submissions on this website are processed and delivered through Web3Forms, a third-party form submission and routing service.",
      "When you submit the contact form, your submission payload is transmitted over encrypted HTTPS to Web3Forms so it can be filtered for spam and delivered to VISYNTH. Form submissions and associated delivery metadata may be stored or processed by our form provider and communication providers strictly for message delivery, spam prevention, and normal operational reliability.",
    ],
  },
  {
    code: "04",
    title: "No Sale of Personal Information",
    body: [
      "VISYNTH does not sell, rent, trade, or lease your personal information or project details to third parties.",
      "We only share information when strictly necessary to operate our communication channels, fulfill a service you have requested, or comply with applicable legal obligations.",
    ],
  },
  {
    code: "05",
    title: "Data Retention",
    body: [
      "We retain inquiry messages and project correspondence only for as long as reasonably necessary to respond to your inquiry, manage an active or prospective client relationship, maintain accurate studio business records, or comply with applicable legal, tax, or accounting requirements.",
      "If an inquiry does not result in an ongoing engagement, routine correspondence may be periodically archived or deleted when no longer needed.",
    ],
  },
  {
    code: "06",
    title: "Data Security",
    body: [
      "VISYNTH implements reasonable technical, administrative, and operational safeguards—including HTTPS encryption in transit and restricted access to studio communication channels—to protect the information you submit against unauthorized access, alteration, or disclosure.",
      "However, no method of transmission over the internet or electronic storage system is completely infallible, and we cannot guarantee absolute security.",
    ],
  },
  {
    code: "07",
    title: "External Links & Direct Messaging",
    body: [
      "Our website includes optional direct links to third-party platforms, including WhatsApp and Instagram (@visynth.official). If you choose to contact VISYNTH via WhatsApp or interact with our profile on Instagram, any information you share on those platforms is governed by the respective privacy policies and terms of those services.",
    ],
  },
  {
    code: "08",
    title: "Your Rights & Requests",
    body: [
      "You may request access to, correction of, or deletion of the personal information you have submitted to VISYNTH at any time, subject to any legal or contractual record-keeping obligations we are required to observe.",
    ],
  },
  {
    code: "09",
    title: "How to Contact VISYNTH Regarding Privacy",
    body: [
      "To request the correction or deletion of your submitted information, or to ask any questions about this Privacy Policy, please reach out to VISYNTH directly using our website Contact form or via our official WhatsApp channel linked below.",
    ],
  },
  {
    code: "10",
    title: "Updates to This Privacy Policy",
    body: [
      "VISYNTH may update this Privacy Policy from time to time to reflect changes in our studio operations, technology providers, or legal requirements. Any updates will be posted on this page with an updated effective date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
                  LEGAL // PRIVACY
                </span>
              </div>
              <span className="text-[10px] tracking-[0.24em] uppercase text-white/55 font-mono">
                EFFECTIVE DATE: OCTOBER 26, 2026
              </span>
            </div>

            <h1 className="font-display font-bold uppercase text-white text-[clamp(2rem,4.6vw,3.9rem)] leading-[0.95] tracking-[-0.03em] mb-4">
              PRIVACY POLICY.
            </h1>

            <p className="text-[#c8c8c8] text-[13.5px] md:text-[15px] leading-[1.68] font-light max-w-[680px]">
              VISYNTH Creative Technology Studio respects your privacy and is
              committed to handling project inquiries and personal data with
              transparency and care.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="divide-y divide-white/[0.09]">
            {POLICY_SECTIONS.map((section) => (
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

          {/* Action Bar for Privacy Inquiries */}
          <div className="mt-8 pt-8 border-t border-white/[0.14] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-[10px] tracking-[0.24em] uppercase text-white/60 mb-1">
                PRIVACY & DATA REQUESTS
              </p>
              <p className="text-[12.5px] text-[#b8b8b8] font-light">
                Submit a data access, correction, or deletion request via our
                Contact channel or WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-3 border border-[#ff1e1e]/60 bg-[#ff1e1e]/[0.1] hover:bg-[#ff1e1e]/[0.2] hover:border-[#ff3b3b] px-5 py-2.5 text-[10px] tracking-[0.24em] uppercase font-medium text-white transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a]"
              >
                <span>CONTACT FORM</span>
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

