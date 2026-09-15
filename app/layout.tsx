import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const montrealUltra = localFont({
  src: "../public/fonts/OTNeueMontreal-BoldItalicUltraSqueezed.woff2",
  variable: "--font-montreal-ultra",
  display: "swap",
});

const montrealExtra = localFont({
  src: "../public/fonts/OTNeueMontreal-BoldItalicExtraSqueezed.woff2",
  variable: "--font-montreal-extra",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CARROLL.COOL",
  description: "Cool stuff made by Carrolls",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full ${montrealUltra.variable} ${montrealExtra.variable}`}
    >
      <body className="relative isolate min-h-full flex flex-col bg-black text-white font-montreal-bold-italic-extra-squeezed">

        {/* NOISE */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 bg-[url('/images/noise.png')] bg-size-[150px] bg-repeat mix-blend-soft-light opacity-100"
        />

        {/* CONTENT */}
        {children}

        {/* BACKGROUND */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[url('/images/bg-vibe-14.gif')] bg-cover bg-center bg-no-repeat opacity-90"
        />

      </body>
    </html>
  );
}
