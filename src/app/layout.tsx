import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focused TODO",
  description: "A compact TODO app built with Next.js App Router and SQLite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
