'use client';

import React, {useState} from 'react';
import Aggrid from "@/components/aggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise from "@/components/select/selectEnterprise";
import Link from 'next/link';

const rowData = [
    {
        id: 1,
        company: "中油石化事業部",
        factory: "新三輕組",
        indicator: "製程安全資訊之完整性",
        indicatorDetail: "實際具備製程安全資訊文件數",
        department: "件",
        isApplied: "是",
        baselineYear: "110年",
        baselineValue: "18",
        q1Status: "16",
        q3Status: "18",
        targetValue: "18"
    },
    {
        id: 2,
        company: "中油石化事業部",
        factory: "新三輕組",
        indicator: "製程安全資訊之完整性",
        indicatorDetail: "勞工參與製程安全管理提案已改善之件數",
        department: "件",
        isApplied: "是",
        baselineYear: "110年",
        baselineValue: "199",
        q1Status: "160",
        q3Status: "94",
        targetValue: "60"
    },
    {
        id: 3,
        company: "中油石化事業部",
        factory: "新三輕組",
        indicator: "製程安全資訊之完整性",
        indicatorDetail: "實際參與製程安全管理活動總人次",
        department: "人",
        isApplied: "是",
        baselineYear: "110年",
        baselineValue: "129",
        q1Status: "129",
        q3Status: "129",
        targetValue: "129"
    }
];

const columnDefs = [
    { field: "id", headerName: "編號" },
    { field: "company", headerName: "公司" },
    { field: "factory", headerName: "工廠/製程廠" },
    { field: "indicator", headerName: "指標項目" },
    { field: "indicatorDetail", headerName: "指標細項" },
    { field: "department", headerName: "單位" },
    { field: "isApplied", headerName: "是否應用" },
    { field: "baselineYear", headerName: "基線值數據年限" },
    { field: "baselineValue", headerName: "基線值" },
    { field: "q1Status", headerName: "111年Q1執行狀況" },
    { field: "q3Status", headerName: "111年Q3執行狀況" },
    { field: "targetValue", headerName: "目標值" }
];

const categories = [
    { id: "process", name: "製程安全管理(PSM)" },
    { id: "energy", name: "能源管理(EP)" },
    { id: "fire", name: "消防管理(FR)" },
    { id: "env", name: "環保管理(ECO)" }
];

export default function KPI() {
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
                        績效指標
                    </h1>
                    <div className="flex justify-end gap-x-8">
                        <Link href="/kpi/newKpi" tabIndex={-1}>
                            <button
                                type="button"
                                className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            >
                                新增指標
                            </button>
                        </Link>
                    </div>
                    <SelectEnterprise/>
                    <div className="flex justify-end gap-x-8">
                        <Link href=" ">
                            <button
                                type="button"
                                className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            >
                                查詢
                            </button>
                        </Link>
                    </div>
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
                                    客製型指標
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
                                        : "這裡是客制型指標的內容。"}
                                </p>
                                {/* AgGrid 表格 */}
                                <div className="mt-6 px-4 lg:px-6">
                                    <Aggrid rowData={rowData} columnDefs={columnDefs} />
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};