import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intern Task & Progress Tracker",
  description: "Internal task tracking for leads and interns"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
