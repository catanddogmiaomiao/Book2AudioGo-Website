import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book2Audio GO — 让每一本书都有声音",
  description: "免费将 EPUB、TXT、PDF、DOCX 转换为自然流畅的有声书。支持中文、日文、韩文与英文语音。",
  icons: { icon: "/BOOK2AUDIOGO.ico", shortcut: "/BOOK2AUDIOGO.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
