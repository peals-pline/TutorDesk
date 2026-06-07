import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TutorDesk",
  description:
    "Local-first open-source workspace for tutors to track students, lessons, homework, mistakes, and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
