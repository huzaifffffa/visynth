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

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export function ContactSection({
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
          className="w-full max-w-[clamp(330px,48vw,700px)] flex flex-col items-start will-change-transform"
        >
          <SectionEyebrow label="CONTACT" />

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
            className="mt-[clamp(10px,1.4vw,22px)] text-[clamp(13.5px,1.3vw,20px)] font-extralight tracking-[0.02em] text-[#e2e2e2] will-change-transform"
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
            className="mt-[clamp(16px,2vw,30px)] w-full will-change-transform"
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
                    aria-label="Message VISYNTH on WhatsApp (opens in a new tab)"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#ff2a2a]/60 bg-[#ff2a2a]/10 hover:bg-[#ff2a2a]/20 text-[10px] tracking-[0.22em] uppercase text-[#ff5757] hover:text-white transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
                  >
                    <span>WHATSAPP</span>
                    <span aria-hidden="true">↗</span>
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
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Primary Action: SEND INQUIRY */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-[#e61e1e] hover:bg-[#ff2a2a] text-white text-[10px] font-semibold tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_0_16px_rgba(230,30,30,0.35)] hover:shadow-[0_0_24px_rgba(255,42,42,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        <span>
                          {isSubmitting ? "SENDING INQUIRY..." : "SEND INQUIRY"}
                        </span>
                        <CtaArrowIcon />
                      </button>

                      {/* Secondary Action: WHATSAPP */}
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Message VISYNTH on WhatsApp (opens in a new tab)"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/25 hover:border-[#ff2a2a]/80 bg-white/[0.03] hover:bg-[#ff2a2a]/10 text-white/90 hover:text-white text-[9.5px] font-medium tracking-[0.22em] uppercase transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a] rounded-sm"
                      >
                        <span
                          aria-hidden="true"
                          className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a]"
                        />
                        <span>WHATSAPP</span>
                      </a>
                    </div>

                    {/* Secondary Link: INSTAGRAM */}
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit VISYNTH on Instagram @visynth.official (opens in a new tab)"
                      className="inline-flex items-center gap-1.5 text-[9.5px] font-mono tracking-[0.18em] uppercase text-white/55 hover:text-white transition-colors py-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff2a2a] rounded-sm self-start sm:self-auto"
                    >
                      <span>@VISYNTH.OFFICIAL</span>
                      <span aria-hidden="true">↗</span>
                    </a>
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
            aria-label="Chat with VISYNTH on WhatsApp (opens in a new tab)"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
          >
            WHATSAPP
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit VISYNTH on Instagram @visynth.official (opens in a new tab)"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
          >
            INSTAGRAM
          </a>
          <Link
            href="/privacy-policy"
            className="text-white/50 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500/70 rounded-sm"
          >
            PRIVACY POLICY
          </Link>
          <Link
            href="/copyright"
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
}
