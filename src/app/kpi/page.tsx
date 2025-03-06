'use client';

import React, {useState} from 'react';
import Aggrid from "@/components/aggrid";
import ChartExample from "@/components/aggridchart";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Kpi() {
    const [activeTab, setActiveTab] = useState(0);

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "檢視績效指標" }
    ];

    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">

                <div className="space-y-8">
                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        新增/修改績效指標
                    </h1>

                    <div role="tablist" className="tabs tabs-boxed min-w-[120px] text-center">
                        {["製程安全管理", "環保管理", "能源管理", "消防管理"].map((tab, index) => (
                            <a
                                key={index}
                                role="tab"
                                id={`tab-${index}`}
                                aria-selected={activeTab === index} // 指定當前選中的 tab
                                aria-controls={`tabpanel-${index}`} // 關聯對應的內容區
                                tabIndex={0}
                                className={`tab ${activeTab === index ? "tab-active" : ""}`}
                                onClick={() => setActiveTab(index)} // 點擊更新狀態
                                onKeyDown={(e) => {
                                    // 使用鍵盤導航
                                    if (e.key === "ArrowRight") {
                                        setActiveTab((prev) => (prev + 1) % 4); // 循環切換到右側 tab
                                    } else if (e.key === "ArrowLeft") {
                                        setActiveTab((prev) => (prev - 1 + 4) % 4); // 循環切換到左側 tab
                                    } else if (e.key === "Enter") {
                                        // 按下 Enter 時選擇當前 Tab
                                        setActiveTab(index);
                                    }
                                }}
                            >
                                {tab}
                            </a>
                        ))}
                        {/* Tab 對應的內容區 */}
                        {["製程安全管理內容", "環保管理內容", "能源管理內容", "消防管理內容"].map((content, index) => (
                            <div
                                key={index}
                                id={`tabpanel-${index}`}
                                role="tabpanel"
                                aria-labelledby={`tab-${index}`} // 關聯對應的 tab
                                hidden={activeTab !== index} // 隱藏非選中內容區
                                className="p-4"
                            >
                                {content}
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <a href="#"
                           className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">製程安全管理</h5>

                        </a>
                        <a href="#"
                           className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">環保管理</h5>
                        </a>
                        <a href="#"
                           className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">能源管理</h5>
                        </a>
                        <a href="#"
                           className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">消防管理</h5>
                        </a>

                    </div>

                    <Aggrid/>
                    <ChartExample/>
                </div>
            </div>
        </>
    );
};