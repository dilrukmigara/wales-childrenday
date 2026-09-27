import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wales | A Children’s Day Wish for You",
  description: "Celebrate Children's Day with a personalized wish from your teacher at Wales Higher Education Center.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/wales-logo.png",
    shortcut: "/wales-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
