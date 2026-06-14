import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI品牌定位助手",
  description: "3分钟找到品牌定位和差异化卖点，适合中国创业者快速梳理品牌表达。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
