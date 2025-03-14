'use client';
// import type { Metadata } from "next";
import 'focus-visible';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Base from "@/components/header"
import Component from "@/components/footer"
import React from "react";


/**
 * Geist Sans 字體設置
 * 使用 Geist 字體庫，並設置自定義 CSS 變量 "--font-geist-sans"。
 * 支援拉丁字符子集。
 */
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

/**
 * Geist Mono 字體設置
 * 使用 Geist_Mono 字體庫，設置自定義 CSS 變量 "--font-geist-mono"。
 * 支援拉丁字符子集。
 */
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

/**
 * 應用程序的元數據
 * 包括標題與描述，通常用於 SEO 與標籤設置。
 *
 * @property {string} title 應用的標題
 * @property {string} description 應用的描述
 */
const appMetadata = {
    title: '績效指標平台',
    description: '這是一個績效指標平台'
};


export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="zh-TW" data-theme="fantasy">
        <title>{appMetadata.title}</title>
        <meta name="description" content={appMetadata.description}/>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col min-h-screen">
            <a
                href="#"
                accessKey="U"
                tabIndex={0}
                title="上方功能服務選項區"
                className="invisible absolute"
                // onFocus={(e) => e.target.classList.remove("invisible")}
                // onBlur={(e) => e.target.classList.add("invisible")}
            >
                :::
            </a>
            <header>
                <Base/>
            </header>
            <a
                id="skip-to-content"
                href="#center"
                accessKey="C"
                tabIndex={0}
                title="跳轉到中央內容區塊"
                className="invisible absolute"
            >
                :::
            </a>

            <main id="center" className="flex-1">
                {children}
            </main>
            <a
                id="skip-to-footer"
                href="#footer"
                accessKey="B"
                tabIndex={0}
                title="跳轉到下方功能區塊"
                className="invisible absolute"
            >
                :::
            </a>
            <footer id="footer">
                <Component/>
            </footer>
        </div>
        </body>
        </html>

    );
}
