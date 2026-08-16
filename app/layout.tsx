import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Kotlin 全语法与 Android 独立开发完整教程";
const description =
  "50 章中文课程：从 Kotlin 类型系统、协程和 Flow，到 Compose、Navigation 3、离线同步、媒体、登录、支付、测试、安全与 Play 上架。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const image = `${origin}/og.png`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: image, width: 1733, height: 907, alt: "Kotlin 到 Android 50 章完整课程" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
