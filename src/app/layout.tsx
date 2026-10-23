import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "VISYNTH — Creative Technology Studio",
  description:
    "We build distinctive brands, digital experiences, and intelligent technology—from branding and 3D animation to web, app, marketing, and cybersecurity solutions.",
};

const EXTENSION_ATTR_SANITIZER = `
(function () {
  var isExtAttr = function (name) {
    return (
      name === "bis_skin_checked" ||
      name === "bis_register" ||
      name.indexOf("__processed_") === 0
    );
  };
  var cleanElement = function (el) {
    if (!el || !el.attributes) return;
    for (var i = el.attributes.length - 1; i >= 0; i--) {
      var attrName = el.attributes[i].name;
      if (isExtAttr(attrName)) {
        el.removeAttribute(attrName);
      }
    }
  };
  var desc = Object.getOwnPropertyDescriptor(Element.prototype, "attributes");
  if (desc && desc.get) {
    Object.defineProperty(Element.prototype, "attributes", {
      configurable: true,
      enumerable: desc.enumerable,
      get: function () {
        var attrs = desc.get.call(this);
        if (attrs) {
          for (var i = attrs.length - 1; i >= 0; i--) {
            var name = attrs[i].name;
            if (isExtAttr(name)) {
              this.removeAttribute(name);
            }
          }
        }
        return attrs;
      },
    });
  }
  if (typeof document !== "undefined" && document.documentElement) {
    var all = document.querySelectorAll("*");
    for (var j = 0; j < all.length; j++) {
      cleanElement(all[j]);
    }
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased bg-black text-white`}
    >
      <body className="min-h-full bg-[#000000] text-white font-sans selection:bg-red-600/30 selection:text-white overflow-x-hidden">
        <Script
          id="sanitize-extension-attrs"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: EXTENSION_ATTR_SANITIZER }}
        />
        {children}
      </body>
    </html>
  );
}

