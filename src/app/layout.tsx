import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InfraMind777 Practical AI Starter Program — Enrollment",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
