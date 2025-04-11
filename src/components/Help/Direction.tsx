

'use client';

import Breadcrumbs from "@/components/Breadcrumbs";
import React from "react";

export default function Direction(){

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "網站導覽" }
    ];

    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        網站導覽
                    </h1>
                    <div className="card bg-base-100 shadow-xl p-6 mt-6 max-w-3xl w-full mx-auto">
                        <div className="card-body">
                            <h2 className="card-title">本網站依無障礙網頁設計原則建置，主要內容分為三大區塊：</h2>
                            <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                                <li>上方功能區塊</li>
                                <li>中央內容區塊</li>
                                <li>下方功能區塊</li>
                            </ul>

                            <h2 className="mt-6 text-lg font-semibold text-gray-800">快速鍵（Accesskey）設定：</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Alt+U</strong>：右上方功能區塊（回首頁、網站導覽、網站搜尋等）</li>
                                <li><strong>Alt+C</strong>：中央內容區塊（本頁主要內容區）</li>
                                <li><strong>Alt+B</strong>：下方功能區塊</li>
                            </ul>

                            <p className="mt-4 text-gray-700">
                                如果您的瀏覽器是 <strong>Firefox</strong>，請使用 <strong>Shift+Alt+(快速鍵字母)</strong>。
                            </p>

                            <h2 className="mt-6 text-lg font-semibold text-gray-800">鍵盤操作方式：</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>← → 或 ↑↓</strong>：移動標籤順序</li>
                                <li><strong>Home / End</strong>：跳至標籤第一項或最後一項</li>
                                <li><strong>Tab</strong>：跳至內容區並瀏覽資料</li>
                                <li><strong>Tab + Shift</strong>：返回上一筆資料</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}