"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AnimatedHeading,
  CtaArrowIcon,
  SectionEyebrow,
} from "./AnimatedHeading";

interface ContactSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  onReturnHome: () => void;
}

const DISCIPLINE_OPTIONS = [
  "Branding & Identity",
  "3D Animation",
  "Web & App",
  "Digital Marketing",
  "Cybersecurity",
];

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
export const WHATSAPP_URL =
  "https://wa.me/923161108514?text=Hello%20VISYNTH%2C%20I%20would%20like%20to%20discuss%20a%20project.";
export const INSTAGRAM_URL = "https://www.instagram.com/visynth.official/";

export function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export const ContactSection = React.memo(function ContactSection({
  sectionRef,
  onReturnHome,
}: ContactSectionProps) {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [botcheck, setBotcheck] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  const toggleDiscipline = (discipline: string) => {
    if (isSubmitting) return;
    setSelectedDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Honeypot check for automated spam bots
    if (botcheck.trim() !== "") {
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setStatus("error");
      setErrorMessage("Please enter your name before sending.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!trimmedMessage) {
      setStatus("error");
      setErrorMessage("Please include a brief message about your project.");
      return;
    }

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
    if (!accessKey) {
      setStatus("error");
      setErrorMessage(
        "Form configuration is pending activation. Please reach out directly via WhatsApp or Instagram below."
      );
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const payload = {
        access_key: accessKey,
        subject: `New Project Inquiry from ${trimmedName} — VISYNTH`,
        from_name: "VISYNTH Studio Website",
        name: trimmedName,
        email: trimmedEmail,
        replyto: trimmedEmail,
        selected_disciplines:
          selectedDisciplines.length > 0
            ? selectedDisciplines.join(", ")
            : "General Inquiry",
        message: trimmedMessage,
        botcheck: "",
      };

      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: { success?: boolean; message?: string } | null = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok && data?.success === true) {
        setSubmittedName(trimmedName);
        setStatus("success");
        // Clear form only on verified success
        setName("");
        setEmail("");
        setMessage("");
        setSelectedDisciplines([]);
      } else {
        setStatus("error");
        setErrorMessage(
          data?.message ||
            "Unable to deliver your inquiry right now. Please check your connection or contact us via WhatsApp."
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "A network error occurred while sending your message. Please check your connection or contact us via WhatsApp."
      );
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label="Contact"
      className="absolute inset-0 z-20 flex flex-col justify-between w-full h-full pt-[clamp(64px,5.6vw,90px)] pl-[5.95%] pr-[5.95%] opacity-0 pointer-events-none select-none invisible overflow-y-auto overflow-x-hidden"
    >
      <div className="flex-1 flex items-center w-full py-4 sm:py-6">
        <div
          data-contact="container"
          className="w-full max-w-[clamp(330px,48vw,700px)] flex flex-col items-start"
        >
          <SectionEyebrow label="04 / CONTACT" />

          {/* Required Headline: "Let's build what comes next." */}
          <AnimatedHeading
            lines={[
              "Let's build",
              <>
                what comes{" "}
                <span className="text-[#e61e1e] font-light drop-shadow-[0_0_16px_rgba(255,25,25,0.45)]">
                  next.
                </span>
              </>,
            ]}
            className="text-[clamp(26px,3.6vw,56px)] tracking-[0.02em]"
          />

          {/* Required Supporting Copy: "Have an idea in mind? Let's talk." */}
          <p
            data-anim="contact-copy"
            className="mt-[clamp(10px,1.4vw,22px)] text-[clamp(13.5px,1.3vw,20px)] font-extralight tracking-[0.02em] text-[#e2e2e2]"
          >
            Have an idea in mind? Let&apos;s talk.
          </p>

          {/* Accessible Live Region for Form Status Announcements */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {isSubmitting && "Sending your inquiry to VISYNTH..."}
            {isSuccess &&
              `Inquiry received. Thank you, ${submittedName}. Our studio team will respond shortly.`}
            {status === "error" && errorMessage}
          </div>

          {/* Interactive Contact Action / Minimalist Inquiry Form with Dark Protective Overlay */}
          <div
            data-anim="contact-action"
            data-drag-ignore="true"
            className="mt-[clamp(16px,2vw,30px)] w-full"
          >
            {isSuccess ? (
              <div
                role="status"
                aria-live="polite"
                className="w-full max-w-xl bg-black/85 backdrop-blur-md border border-white/15 p-5 sm:p-7 space-y-4 rounded-sm shadow-[0_16px_40px_rgba(0,0,0,0.85)]"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full bg-[#ff2a2a] shadow-[0_0_8px_2px_rgba(255,35,35,0.9)]"
                  />
                  <span className="text-[11px] font-medium tracking-[0.24em] uppercase text-white">
                    INQUIRY RECEIVED
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-light text-white/85 leading-relaxed">
                  Thank you,{" "}
                  <span className="text-white font-normal">{submittedName}</span>
                  . Your project inquiry has been delivered directly to our studio team
                  and we will respond shortly.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setErrorMessage("");
                    }}
                    className="px-4 py-2 border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-[10px] tracking-[0.22em] uppercase text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chat on WhatsApp"
                    aria-label="Message VISYNTH on WhatsApp (opens in a new tab)"
                    className="inline-flex items-center justify-center p-2 text-white/70 hover:text-[#25D366] transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#25D366] rounded-full hover:scale-110"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-xl">
                {/* Subtle dark local overlay behind form ensuring high contrast against any frame */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 sm:-inset-3 bg-black/80 backdrop-blur-md rounded-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.92)] pointer-events-none"
                />

                <form
                  action={WEB3FORMS_ENDPOINT}
                  method="POST"
                  onSubmit={handleSubmit}
                  noValidate
                  className="relative z-10 w-full p-4 sm:p-6 space-y-4 select-text"
                >
                  {/* Hidden metadata for noscript/safe fallback */}
                  <input
                    type="hidden"
                    name="access_key"
                    value={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || ""}
                  />
                  <input
                    type="hidden"
                    name="subject"
                    value="New Project Inquiry — VISYNTH"
                  />
                  <input
                    type="hidden"
                    name="from_name"
                    value="VISYNTH Studio Website"
                  />

                  {/* Hidden Honeypot Field for Spam Protection */}
                  <input
                    type="text"
                    name="botcheck"
                    value={botcheck}
                    onChange={(e) => setBotcheck(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                    style={{ display: "none" }}
                  />

                  {/* Discipline Tags (Optional) */}
                  <div>
                    <span className="block text-[9px] font-mono tracking-[0.22em] uppercase text-white/60 mb-2">
                      SELECT DISCIPLINES (OPTIONAL)
                    </span>
                    <div
                      role="group"
                      aria-label="Project disciplines"
                      className="flex flex-wrap gap-1.5 sm:gap-2"
                    >
                      {DISCIPLINE_OPTIONS.map((discipline) => {
                        const active = selectedDisciplines.includes(discipline);
                        return (
                          <button
                            key={discipline}
                            type="button"
                            disabled={isSubmitting}
                            aria-pressed={active}
                            onClick={() => toggleDiscipline(discipline)}
                            className={`px-2.5 sm:px-3 py-1 text-[9px] sm:text-[9.5px] tracking-[0.18em] uppercase border transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a] disabled:opacity-50 rounded-sm ${
                              active
                                ? "border-[#ff2a2a] bg-[#ff2a2a]/20 text-white shadow-[0_0_12px_rgba(255,42,42,0.3)]"
                                : "border-white/20 bg-white/[0.02] text-white/75 hover:border-white/45 hover:text-white"
                            }`}
                          >
                            {discipline}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Email Input Fields (Distinct visual styling) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-[9px] font-mono tracking-[0.2em] uppercase text-white/70 mb-1"
                      >
                        NAME <span className="text-[#ff3b3b]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (status === "error") setErrorMessage("");
                        }}
                        placeholder="Alex Mercer"
                        aria-label="Your name"
                        className="w-full bg-white/[0.04] border border-white/20 rounded-sm px-3.5 py-2 text-xs tracking-[0.08em] text-white placeholder:text-white/40 focus:border-[#ff2a2a] focus:ring-1 focus:ring-[#ff2a2a] focus:bg-black/60 focus:outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-[9px] font-mono tracking-[0.2em] uppercase text-white/70 mb-1"
                      >
                        EMAIL <span className="text-[#ff3b3b]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        disabled={isSubmitting}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") setErrorMessage("");
                        }}
                        placeholder="alex@company.com"
                        aria-label="Your email"
                        className="w-full bg-white/[0.04] border border-white/20 rounded-sm px-3.5 py-2 text-xs tracking-[0.08em] text-white placeholder:text-white/40 focus:border-[#ff2a2a] focus:ring-1 focus:ring-[#ff2a2a] focus:bg-black/60 focus:outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Project Message Field */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-[9px] font-mono tracking-[0.2em] uppercase text-white/70 mb-1"
                    >
                      PROJECT BRIEF <span className="text-[#ff3b3b]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={3}
                      required
                      disabled={isSubmitting}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (status === "error") setErrorMessage("");
                      }}
                      placeholder="Tell us about your objectives, timeline, or scope..."
                      aria-label="Project details"
                      className="w-full bg-white/[0.04] border border-white/20 rounded-sm px-3.5 py-2 text-xs tracking-[0.06em] text-white placeholder:text-white/40 focus:border-[#ff2a2a] focus:ring-1 focus:ring-[#ff2a2a] focus:bg-black/60 focus:outline-none transition-all resize-none disabled:opacity-50"
                    />
                  </div>

                  {/* Visible Error Feedback (preserves entered data) */}
                  {status === "error" && errorMessage && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="border-l-2 border-[#ff2a2a] bg-[#ff2a2a]/15 px-3 py-2 text-[11px] font-light tracking-[0.03em] text-white"
                    >
                      {errorMessage}
                    </div>
                  )}

                  {/* Primary & Secondary Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    {/* Primary Action: SEND INQUIRY */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-[#e61e1e] hover:bg-[#ff2a2a] text-white text-[10px] font-semibold tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_0_16px_rgba(230,30,30,0.35)] hover:shadow-[0_0_24px_rgba(255,42,42,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer self-start sm:self-auto"
                    >
                      <span>
                        {isSubmitting ? "SENDING INQUIRY..." : "SEND INQUIRY"}
                      </span>
                      <CtaArrowIcon />
                    </button>

                    {/* Secondary Social Action Logos: WHATSAPP & INSTAGRAM (No outline box) */}
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        aria-label="Message VISYNTH on WhatsApp (opens in a new tab)"
                        className="inline-flex items-center justify-center p-2 text-white/70 hover:text-[#25D366] transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#25D366] rounded-full hover:scale-110 cursor-pointer"
                      >
                        <WhatsAppIcon className="w-5 h-5" />
                      </a>

                      <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Visit Instagram @visynth.official"
                        aria-label="Visit VISYNTH on Instagram @visynth.official (opens in a new tab)"
                        className="inline-flex items-center justify-center p-2 text-white/70 hover:text-[#E4405F] transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E4405F] rounded-full hover:scale-110 cursor-pointer"
                      >
                        <InstagramIcon className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar with Identity, Socials, Legal Links, and Back to Top */}
      <footer
        data-drag-ignore="true"
        className="w-full py-4 sm:py-5 border-t border-white/[0.12] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 text-[9px] sm:text-[9.5px] tracking-[0.2em] uppercase text-white/65 shrink-0"
      >
        <span className="text-white/70">
          © 2026 VISYNTH — CREATIVE TECHNOLOGY STUDIO
        </span>

        <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            aria-label="Chat with VISYNTH on WhatsApp (opens in a new tab)"
            className="text-white/70 hover:text-[#25D366] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#25D366] rounded-full p-1 hover:scale-110"
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Instagram @visynth.official"
            aria-label="Visit VISYNTH on Instagram @visynth.official (opens in a new tab)"
            className="text-white/70 hover:text-[#E4405F] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E4405F] rounded-full p-1 hover:scale-110"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/privacy-policy"
            prefetch={false}
            className="text-white/50 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
          >
            PRIVACY POLICY
          </Link>
          <Link
            href="/copyright"
            prefetch={false}
            className="text-white/50 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
          >
            COPYRIGHT
          </Link>
          <button
            type="button"
            onClick={onReturnHome}
            aria-label="Scroll back to top of home page"
            className="text-white/80 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
          >
            BACK TO TOP ↑
          </button>
        </div>
      </footer>
    </section>
  );
});
