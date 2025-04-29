'use client';
// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header"
import Footer from "@/components/footer"
import React, {useEffect, useRef, useState} from "react";
import {useauthStore} from "@/Stores/authStore";
import {LicenseManager as GridLicenseManager} from 'ag-grid-enterprise';
import { LicenseManager as ChartLicenseManager } from 'ag-charts-enterprise';
const license = "Using_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-067721}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Industrial_Safety_And_Health_Association_(ISHA)_Of_The_R.O.C}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{}_need_to_be_licensed___{}_has_been_granted_a_Deployment_License_Add-on_for_{1}_Production_Environment___This_key_works_with_{AG_Charts_and_AG_Grid}_Enterprise_versions_released_before_{27_October_2025}____[v3]_[0102]_MTc2MTUyMzIwMDAwMA==14fa603063a97c2c3a7a73a15786443e";
import { ConfirmDialogProvider } from "@/hooks/useConfirmDialog";

GridLicenseManager.setLicenseKey(license);
ChartLicenseManager.setLicenseKey(license);

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
// const appMetadata = {
//     title: '績效指標平台',
//     description: '這是一個績效指標平台'
// };


export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const {checkAuthStatus} = useauthStore()
    useEffect(() => {
        console.log("驗證")
        checkAuthStatus();
    }, []); // Empty dependency array means it runs only once after the component mounts

    const headerRef = useRef<HTMLDivElement | null>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };

        updateHeight(); // 初始化時先抓一次

        const observer = new ResizeObserver(() => updateHeight());
        if (headerRef.current) observer.observe(headerRef.current);

        return () => {
            if (headerRef.current) observer.unobserve(headerRef.current);
        };
    }, []);

    return (
        <html lang="zh-TW" data-theme="fantasy">
        {/*<head>*/}
        {/*    <title>{appMetadata.title}</title>*/}
        {/*    <meta name="description" content={appMetadata.description}/>*/}
        {/*</head>*/}
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div ref={headerRef}
            className="fixed top-0 left-0 w-full z-50">
            <Header/>
        </div>
        <div className="flex flex-col min-h-screen" style={{ paddingTop: headerHeight }}>
            <a
                href="#top"
                accessKey="U"
                tabIndex={0}
                title="上方功能服務選項區"
                className="invisible absolute"
                // onFocus={(e) => e.target.classList.remove("invisible")}
                // onBlur={(e) => e.target.classList.add("invisible")}
            >
                :::
            </a>

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
                <ConfirmDialogProvider>
                {children}
                </ConfirmDialogProvider>
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
                <Footer/>
            </footer>
        </div>
        </body>
        </html>

    );
}
