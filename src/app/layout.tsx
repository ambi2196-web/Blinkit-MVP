import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import BottomCartBar from "@/components/BottomCartBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Ritual by Blinkit",
  description: "An evidence-based routine advisor, concept prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CartProvider>
          <div className="mx-auto min-h-screen max-w-md bg-gray-50 pb-20">
            {children}
          </div>
          <div className="mx-auto max-w-md">
            <BottomCartBar />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
