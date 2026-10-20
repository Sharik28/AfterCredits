import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "AfterCredits — Your TV life, documented",
  description:
    "The social platform for television fans. Rate individual seasons, track your watchlist, share spoiler-safe reviews, and discover shows with fellow TV lovers.",
  keywords: [
    "TV shows",
    "television",
    "season ratings",
    "watchlist",
    "Letterboxd for TV",
    "TV reviews",
    "spoiler safe",
  ],
  openGraph: {
    title: "AfterCredits — Your TV life, documented",
    description:
      "Rate individual seasons, track your watchlist, and share spoiler-safe reviews with fellow TV lovers.",
    type: "website",
  },
};

import { AuthProvider } from "@/lib/auth/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-[#f4f4f6] min-h-screen flex flex-col antialiased selection:bg-rose-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
