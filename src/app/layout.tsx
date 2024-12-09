import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Visibility Dashboard | xfunnel.ai",
  description: "Track and analyze your company's visibility across AI platforms",
  icons: {
    icon: [
      {
        url: "/Favicon(40x40).png",
        sizes: "40x40",
        type: "image/png",
      },
      {
        url: "/Favicon(192x192).png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/Favicon(512x512).png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/Favicon(192x192).png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}>
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center gap-2">
                  <img 
                    src="/Favicon(192x192).png" 
                    alt="xfunnel logo" 
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                  <Link 
                    href="/" 
                    className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                             text-transparent bg-clip-text transition-all duration-300 
                             hover:from-blue-500 hover:to-purple-500"
                  >
                    xfunnel.ai
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/"
                    className="inline-flex items-center px-1 pt-1 text-gray-600 
                             hover:text-blue-600 transition-colors duration-300
                             border-b-2 border-transparent hover:border-blue-600"
                  >
                    Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}