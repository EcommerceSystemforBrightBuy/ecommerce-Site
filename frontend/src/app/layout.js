import { Inter } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "BrightBuy | Texas Consumer Electronics & Robotics Retail",
  description:
    "Texas consumer electronics and STEM robotics catalog with central warehouse inventory and fast statewide delivery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-neutral-950">
        <ShopProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </ShopProvider>
      </body>
    </html>
  );
}
