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
  // This tells Google the exact name of the site
  title: "VLK | Visual Lukks Official",
  description: "The official digital terminal for VLK. Explore the latest collections and exclusive drops from Visual Lukks.",
  keywords: ["VLK", "Visual Lukks", "VLK Brand", "Clothing", "Design"],
  
  // 1. ACTION REQUIRED: Replace with the code from your Google Search Console screenshot
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

        {/* 2. BRAND AUTHORITY SCHEMA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "VLK",
              "alternateName": "Visual Lukks",
              "url": "https://your-live-domain.com", // 3. ACTION REQUIRED: Put your real URL here
              "logo": "https://your-live-domain.com/visual%20lukks.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support"
              },
              "sameAs": [
                "https://www.instagram.com/visuallukks", // Example - update with your actual links
                "https://twitter.com/visuallukks"
              ]
            }),
          }}
        />
      </body>
    </html>
  );
}