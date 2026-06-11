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

export const metadata: Metadata = {
  title: "Outfit Not Random | Official Digital Terminal",
  description: "Intentional streetwear curations and structured architectural fashion silhouettes.",
  keywords: ["Outfit Not Random", "ONR", "ONR Brand", "Clothing", "Design", "Architecture Streetwear"],
  verification: {
    google: "YOUR_CODE_FROM_SEARCH_CONSOLE", 
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

        {/* BRAND AUTHORITY SCHEMA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Outfit Not Random",
              "alternateName": "ONR",
              "url": "https://ONR-fashion-live-gy5v.vercel.app", 
              "logo": "https://ONR-fashion-live-gy5v.vercel.app/vlogo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support"
              },
              "sameAs": [
                "https://www.instagram.com/outfitnotrandom",
                "https://twitter.com/outfitnotrandom"
              ]
            }),
          }}
        />
      </body>
    </html>
  );
}