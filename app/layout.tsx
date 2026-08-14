import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kotlin 全语法与 Android 独立开发完整教程",
  description:
    "从 Kotlin 类型系统、函数式编程与协程，到 Jetpack Compose、架构、数据、测试和发布的完整中文课程。",
};

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
