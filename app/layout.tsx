import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "字缠 Hanzi Tangle — 每日汉字拼字游戏",
  description:
    "把拆散的偏旁部件拼回正确的汉字，把汉字放回词语的位置。每天一题，认识形声字。",
  openGraph: {
    title: "字缠 Hanzi Tangle",
    description: "把拆散的偏旁部件拼回正确的汉字。每日一题，玩着学会形声字。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}