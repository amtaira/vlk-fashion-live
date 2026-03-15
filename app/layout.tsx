import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. BRAND IDENTITY METADATA
export const metadata: Metadata = {
  title: "VLK | Visual Lukks Official",
  description: "Official digital terminal for VLK. Explore exclusive drops and the latest collections from Visual Lukks.",
  keywords: ["VLK", "Visual Lukks", "VLK Brand", "VLK Clothing", "Visual Lukks Official"],
  // 2. GOOGLE VERIFICATION (Paste your code from Search Console here)
  verification: {
    google: "PASTE_YOUR_GOOGLE_VERIFICATION_CODE_HERE",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* 3. ORGANIZATION SCHEMA (Hidden data for Google) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "VLK",
              "alternateName": "Visual Lukks",
              "url": "https://your-live-domain.com",
              "logo": "https://your-live-domain.com/logo1.png",
              "sameAs": [
                "https://instagram.com/your-handle", // Add your social links here
                "https://twitter.com/your-handle"
              ]
            }),
          }}
        />
      </body>
    </html>
  );
}