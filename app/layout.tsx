import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutri-Receipt AI",
  description: "Healthy swap recommendations grounded in actual price, prep, and nutrition rules."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
