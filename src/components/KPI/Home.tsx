'use client';
import React, { useEffect } from 'react';
import Breadcrumbs from "@/components/Breadcrumbs";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ClipboardDocumentCheckIcon, DocumentChartBarIcon, PencilSquareIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useauthStore } from '@/Stores/authStore';

export default function Home() {

    const isLoggedIn = useauthStore(state => state.isLoggedIn);

    useEffect(() => {
        console.log("✅ 當前登入狀態 isLoggedIn =", isLoggedIn);
    }, [isLoggedIn]);

    const router = useRouter();

    const breadcrumbItems = [
        { label: "首頁" }
    ];

    useEffect(() => {
        const warning = localStorage.getItem("login-warning");
        if (warning) {
            toast.custom((t) => (
                <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 max-w-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-700">{warning}</span>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                localStorage.removeItem("login-warning");
                            }}
                            className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            知道了
                        </button>
                    </div>
                </div>
            ), { duration: Infinity });
        }
    }, []);

    const menuItems = [
        {
            title: "績效指標檢視",
            description: "查看績效指標完成情況與趨勢分析",
            icon: <ClipboardDocumentCheckIcon className="w-8 h-8 text-indigo-600" />,
            href: "/kpi",
            color: "indigo",
            bgGradient: "from-indigo-50 to-blue-50",
            iconBg: "bg-indigo-100",
            hoverShadow: "hover:shadow-indigo-200/50"
        },
        {
            title: "委員建議檢視",
            description: "檢視委員提供之改善建議與追蹤回覆",
            icon: <EyeIcon className="w-8 h-8 text-emerald-600" />,
            href: "/suggest",
            color: "emerald",
            bgGradient: "from-emerald-50 to-green-50",
            iconBg: "bg-emerald-100",
            hoverShadow: "hover:shadow-emerald-200/50"
        },
        {
            title: "填報資料",
            description: "填寫與提交最新季度的績效或建議資料",
            icon: <PencilSquareIcon className="w-8 h-8 text-amber-600" />,
            href: "/reportEntry",
            color: "amber",
            bgGradient: "from-amber-50 to-yellow-50",
            iconBg: "bg-amber-100",
            hoverShadow: "hover:shadow-amber-200/50"
        },
        {
            title: "報表檢視",
            description: "檢視歷年執行報表與圖表資料分析",
            icon: <DocumentChartBarIcon className="w-8 h-8 text-blue-600" />,
            href: "/report",
            color: "blue",
            bgGradient: "from-blue-50 to-cyan-50",
            iconBg: "bg-blue-100",
            hoverShadow: "hover:shadow-blue-200/50"
        }
    ];

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            {/* 背景漸層 */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -z-10" />

            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-8 lg:px-8">
                <div className="space-y-12 w-full max-w-7xl mx-auto">

                    {/* 標題區塊 */}
                    <div className="text-center space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 z-10">
                                績效指標資料庫平台
                            </h1>
                            <div
                                className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto rounded-full"></div>
                        </div>

                    </div>

                    {/* 主要功能選單 */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center">選擇功能模組</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            {menuItems.map((item, index) => (
                                <div
                                    key={index}
                                    className={`group relative overflow-hidden bg-gradient-to-br ${item.bgGradient} rounded-2xl border border-gray-200 hover:border-${item.color}-300 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl ${item.hoverShadow} active:scale-95`}
                                    onClick={() => router.push(item.href)}
                                >
                                    {/* 背景裝飾 */}
                                    <div className={`absolute -top-10 -right-10 w-20 h-20 bg-${item.color}-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity`} />

                                    <div className="relative p-8 flex flex-col items-start gap-4 h-full">
                                        {/* 圖標 */}
                                        <div className={`${item.iconBg} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300`}>
                                            {item.icon}
                                        </div>

                                        {/* 內容 */}
                                        <div className="space-y-2 flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* 前往按鈕 */}
                                        <div className={`mt-auto flex items-center gap-2 text-${item.color}-600 font-medium text-sm group-hover:text-${item.color}-700 transition-colors`}>
                                            <span>前往</span>
                                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* 輔助功能連結 */}
                    <div className="flex justify-center gap-8 pt-4">
                        <button
                            onClick={() => router.push('/about')}
                            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium group"
                        >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            關於我們
                        </button>
                        <button
                            onClick={() => router.push('/direction')}
                            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium group"
                        >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            網頁導覽
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}