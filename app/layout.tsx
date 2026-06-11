// Location: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Replaced system Arial defaults with Inter to provide clean typography structure
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Outfit Not Random | Official Digital Terminal",
  description: "Intentional streetwear curations and structured architectural fashion silhouettes.",
  keywords: ["Outfit Not Random", "ONR", "ONR Brand", "Clothing Kenya", "Architectural Streetwear", "Design Engine"],
  verification: {
    // Keeps verification handshake accurate
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
      <body className={`${inter.className} antialiased bg-[#141612] text-[#eaece6]`}>
        {children}

        {/* BRAND AUTHORITY STRUCTURE MARKUP SCHEMA */}
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