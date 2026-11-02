import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

const instrumentSans = Instrument_Sans({
  variable: "--font-studio",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

const SITE_URL = "https://visynth-seven.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VISYNTH | Design and Web Studio",
    template: "%s VISYNTH",
  },
  description:
    "VISYNTH designs visual identities, 3D work, websites and digital products.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VISYNTH Design and Web Studio",
    description:
      "Visual identity, 3D work, websites and digital products from one independent studio.",
    url: SITE_URL,
    siteName: "VISYNTH",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/portfolio/work-02.webp",
        width: 800,
        height: 1040,
        alt: "VISYNTH studio visual",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VISYNTH Design and Web Studio",
    description:
      "Visual identity, 3D work, websites and digital products from one independent studio.",
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
    "Independent studio for visual identity, 3D work, websites and digital products.",
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
      className={`${instrumentSans.variable} h-full antialiased bg-black text-white`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#000000] text-white font-sans selection:bg-red-600/30 selection:text-white overflow-x-clip"
      >
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[10000] -translate-y-24 bg-white px-4 py-3 text-sm font-semibold text-black transition-transform duration-200 focus:translate-y-0"
        >
          Skip to main content
        </a>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('visynth_preload_complete')==='true')document.documentElement.classList.add('visynth-preloaded')}catch(e){}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <SmoothScrollProvider>
          <div id="visynth-app-content">{children}</div>
        </SmoothScrollProvider>
        <noscript>
          <style>{`[data-testid="site-preloader"]{display:none!important}html,body{overflow:auto!important}#main-content{height:auto!important;overflow:visible!important}#home,#skills,#work,#about,#contact{position:relative!important;inset:auto!important;height:auto!important;min-height:70vh;opacity:1!important;visibility:visible!important;pointer-events:auto!important;padding-top:100px;padding-bottom:40px}#work{display:none}#mobile-navigation-drawer{display:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}

