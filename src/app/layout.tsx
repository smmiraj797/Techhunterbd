import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechHunterBD | Flagship Gadget & Tech Destination in Bangladesh",
  description:
    "Bangladesh's premier consumer electronics portal. Flagship smartphones, laptops, high-fidelity audio, gaming gear, and PC components with official warranty and express delivery.",
  keywords: [
    "TechHunterBD",
    "Gadget Shop Bangladesh",
    "Smartphones BD",
    "Gaming Laptop BD",
    "bKash Payment Gadget",
    "Official Warranty Tech BD",
    "Dhaka Same Day Delivery Tech"
  ],
  authors: [{ name: "TechHunterBD Architect Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
