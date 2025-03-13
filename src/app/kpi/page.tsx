'use client';

import React, {useState} from 'react';
import Aggrid from "@/components/aggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise from "@/components/selectEnterprise";

const categories = [
    { id: "process", name: "製程安全管理" },
    { id: "env", name: "環保管理" },
    { id: "energy", name: "能源管理" },
    { id: "fire", name: "消防管理" }
];

export default function Kpi() {
    const [activeTab, setActiveTab] = useState("process");
    const [activeType, setActiveType] = useState("basic"); // 'basic' or 'custom'
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
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        新增/修改績效指標
                    </h1>
                    <SelectEnterprise/>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="w-full mx-auto">
                            {/* 第一層：Tab 切換主要類別 */}
                            <div className="tabs tabs-boxed bg-base-200 p-2 rounded-lg">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        className={`tab ${activeTab === category.id ? "tab-active bg-primary text-white" : "text-gray-700"}`}
                                        onClick={() => setActiveTab(category.id)}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>

                            {/* 第二層：Segmented Control 切換指標類型 */}
                            <div className="join flex justify-center mt-4">
                                <button
                                    className={`join-item btn ${activeType === "basic" ? "btn-active btn-primary" : "btn-ghost"}`}
                                    onClick={() => setActiveType("basic")}
                                >
                                    基礎型指標
                                </button>
                                <button
                                    className={`join-item btn ${activeType === "custom" ? "btn-active btn-primary" : "btn-ghost"}`}
                                    onClick={() => setActiveType("custom")}
                                >
                                    課制型指標
                                </button>
                            </div>

                            {/* 內容區塊 */}
                            <div className="card bg-base-100 shadow-md p-6 mt-4">
                                <h2 className="text-xl font-bold text-primary">
                                    {categories.find((c) => c.id === activeTab)?.name}
                                </h2>
                                <p className="mt-2 text-gray-600">
                                    {activeType === "basic"
                                        ? "這裡是基礎型指標的內容。"
                                        : "這裡是課制型指標的內容。"}
                                </p>
                            </div>

                            {/* AgGrid 表格 */}
                            <div className="mt-6 px-4 lg:px-6">
                                <Aggrid/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};