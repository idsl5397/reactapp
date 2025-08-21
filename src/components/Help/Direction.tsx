'use client';

import Breadcrumbs from "@/components/Breadcrumbs";
import React from "react";
import Link from "next/link";
import { useMenuStore } from "@/Stores/menuStore";
import { useauthStore } from "@/Stores/authStore";

const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface MenuItem {
    id: number;
    label: string;
    link: string;
    icon: string | null;
    parentId: number | null;
    sortOrder: number;
    isActive: number;
    menuType: string;
    children?: MenuItem[];
}

export default function Direction() {
    const menu = useMenuStore((state) => state.menu);
    const hasMenu = useMenuStore((state) => state.hasMenu);
    const { isLoggedIn } = useauthStore();

    const breadcrumbItems = [
        { label: "首頁", href: `${NPbasePath}/home` },
        { label: "網站導覽" },
    ];

    // 遞迴渲染選單：父層用數字編號，子層用羅馬數字
    const renderMenu = (items: MenuItem[]) => {
        if (!items || items.length === 0) return null;
        return (
            <ul className="list-decimal pl-6 space-y-2 text-gray-800">
                {items.map((item) => (
                    <li key={item.id}>
                        {item.link ? (
                            <Link href={item.link} className="text-gray-700 hover:underline">
                                {item.label}
                            </Link>
                        ) : (
                            <span>{item.label}</span>
                        )}
                        {item.children && item.children.length > 0 && (
                            <ul className="list-[lower-roman] pl-6 space-y-1 text-gray-700 mt-2">
                                {item.children.map((child) => (
                                    <li key={child.id}>
                                        {child.link ? (
                                            <Link href={child.link} className="hover:underline">
                                                {child.label}
                                            </Link>
                                        ) : (
                                            <span>{child.label}</span>
                                        )}
                                        {/* 第三層（若有）一樣用遞迴，仍用羅馬數字樣式 */}
                                        {child.children && child.children.length > 0 && (
                                            <ul className="list-[lower-roman] pl-6 space-y-1 mt-1">
                                                {child.children.map((gchild) => (
                                                    <li key={gchild.id}>
                                                        {gchild.link ? (
                                                            <Link href={gchild.link} className="hover:underline">
                                                                {gchild.label}
                                                            </Link>
                                                        ) : (
                                                            <span>{gchild.label}</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
                <li>
                    <span>說明</span>
                    <ul className="list-[lower-roman] pl-6 space-y-1 text-gray-700">
                        <li>
                            <Link href="/direction">網站導覽</Link>
                        </li>
                        <li>
                            <Link href="/about">關於我們</Link>
                        </li>
                    </ul>
                </li>
                <li>
                    <Link href="/profile">個人資料</Link>
                </li>
            </ul>
        );
    };

    return (
        <>
            <div className="w-full flex justify-start">
            <Breadcrumbs items={breadcrumbItems}/>
            </div>

            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        網站導覽
                    </h1>

                    <div className="card bg-white shadow-xl p-6 mt-6 max-w-3xl w-full mx-auto">
                        <div className="card-body">
                            <h2 className="card-title text-gray-800">
                                本網站依無障礙網頁設計原則建置，主要內容分為三大區塊：
                            </h2>
                            <ul className="list-decimal pl-6 space-y-2 text-gray-800">
                                <li>上方功能區塊</li>
                                <li>中央內容區塊</li>
                                <li>下方功能區塊</li>
                            </ul>

                            <h2 className="mt-6 text-lg font-semibold text-gray-800">快速鍵（Accesskey）設定：</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-800">
                                <li>
                                    <strong>Alt+U</strong>：右上方功能區塊
                                </li>
                                <li>
                                    <strong>Alt+C</strong>：中央內容區塊
                                </li>
                                <li>
                                    <strong>Alt+H</strong>：下方功能區塊
                                </li>
                            </ul>
                            <p className="mt-4 text-gray-800">
                                如果您的瀏覽器是 <strong>Firefox</strong>，請使用{" "}
                                <strong>Shift+Alt+(快速鍵字母)</strong>。
                            </p>

                            <h2 className="mt-6 text-lg font-semibold text-gray-800">鍵盤操作方式：</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-800">
                                <li>
                                    <strong>← → 或 ↑↓</strong>：移動標籤順序
                                </li>
                                <li>
                                    <strong>Home / End</strong>：跳至標籤第一項或最後一項
                                </li>
                                <li>
                                    <strong>Tab</strong>：跳至內容區並瀏覽資料
                                </li>
                                <li>
                                    <strong>Tab + Shift</strong>：返回上一筆資料
                                </li>
                            </ul>

                            <h2 className="mt-6 text-lg font-semibold text-gray-800">網站架構：</h2>
                            <ul className="list-decimal pl-6 space-y-2 text-gray-800">
                                <li>
                                    <Link href="/">首頁</Link>
                                </li>
                                <li>
                                    <span>說明</span>
                                    <ul className="list-[lower-roman] pl-6 space-y-1 text-gray-700">
                                        <li>
                                            <Link href="/direction">網站導覽</Link>
                                        </li>
                                        <li>
                                            <Link href="/about">關於我們</Link>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <Link href="/login">登入</Link>
                                </li>
                                <li>
                                    <Link href="/register">註冊</Link>
                                </li>
                            </ul>

                            <h2 className="mt-6 text-lg font-semibold text-gray-800">登入後網站架構：</h2>
                            {isLoggedIn && hasMenu ? (
                                renderMenu(menu as MenuItem[])
                            ) : (
                                <p className="text-gray-500">請先登入以查看完整功能選單。</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
