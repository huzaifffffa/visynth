import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { SitePreloader } from "@/components/SitePreloader";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

const SITE_URL = "https://visynth-seven.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VISYNTH — Creative Technology Studio",
    template: "%s — VISYNTH",
  },
  description:
    "We build distinctive brands, digital experiences, and intelligent technology—from branding and 3D animation to web, app, marketing, and cybersecurity solutions.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VISYNTH — Creative Technology Studio",
    description:
      "Where vision becomes growth. Distinctive brands, cinematic 3D motion, creative web engineering, and intelligent cybersecurity.",
    url: SITE_URL,
    siteName: "VISYNTH",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/portfolio/work-02.webp",
        width: 800,
        height: 1040,
        alt: "VISYNTH — Signature Studio Creative Visual",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VISYNTH — Creative Technology Studio",
    description:
      "Where vision becomes growth. Distinctive brands, cinematic 3D motion, creative web engineering, and intelligent cybersecurity.",
    images: ["/portfolio/work-02.webp"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VISYNTH",
  legalName: "VISYNTH Creative Technology Studio",
  url: SITE_URL,
  logo: `${SITE_URL}/visynth-logo.png`,
  description:
    "Creative technology studio specializing in branding, 3D animation, web and application development, digital marketing, and cybersecurity.",
  sameAs: [
    "https://www.instagram.com/visynth.official/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} h-full antialiased bg-black text-white`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#000000] text-white font-sans selection:bg-red-600/30 selection:text-white overflow-x-hidden"
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('visynth_seen_v4')==='true'){document.documentElement.classList.add('visynth-preloaded');document.body.classList.add('visynth-preloaded');}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <SitePreloader />
        <div id="visynth-app-content">{children}</div>
      </body>
    </html>
  );
}

