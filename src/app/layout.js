import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QRastic! – Free QR Code Generator",
  description: "Generate high-quality QR codes instantly and for free with QRastic. No sign-up required.",
  keywords: ["QR code generator", "free QR code", "QR code online", "QRastic", "create QR code"],
  robots: "index, follow",
  openGraph: {
    title: "QRastic! – Free QR Code Generator",
    description: "Generate high-quality QR codes instantly and for free with QRastic.",
    url: "https://www.qrastic.com", // <-- aggiorna con il dominio reale
    siteName: "QRastic",
    type: "website",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
