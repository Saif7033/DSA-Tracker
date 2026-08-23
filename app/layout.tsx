import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSA Tracker — Personal Problem Solving History",
  description: "Track DSA and LeetCode problems, organize by topic & difficulty, and maintain structured solution notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
