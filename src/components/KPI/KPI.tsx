'use client';

import React, { useState } from 'react';
import GridComponent from "@/components/KpiAggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectKpiEntriesByDate, { SelectionPayload } from "@/components/select/selectKpiEntriesByDate";
import Link from 'next/link';
import axios from "axios";
import { ColDef } from "ag-grid-community";
import { Toaster, toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: "/proxy",
});

const categories = [
    { id: "tab_all", name: "全部類別", icon: "📊" },
    { id: "製程安全管理", name: "製程安全管理(PSM)", icon: "🔒" },
    { id: "環保管理", name: "環保管理(EP)", icon: "🌱" },
    { id: "消防管理", name: "消防管理(FR)", icon: "🚨" },
    { id: "能源管理", name: "能源管理(ECO)", icon: "⚡" }
];

const columnTitleMap: Record<string, string> = {
    company: "工廠名稱",
    productionSite: "工場/製程區",
    category: "指標類型",
    field: "指標領域",
    indicatorNumber: "指標編號",
    indicatorName: "指標名稱",
    detailItemId: "指標細項編號",
    detailItemName: "指標細項名稱",
    unit: "單位",
    isIndicator:"是否是指標(否為計算項目)",
    isApplied: "是否應用",
    baselineYear: "基線年",
    baselineValue: "基線值",
    targetValue: "目標值",
    remarks: "備註",
    reports: "歷史所有執行狀況",
    comparisonOperator: "公式",
    lastBaselineYear: "基線年",
    lastBaselineValue: "基線值",
    lastTargetValue: "目標值",
    lastKpiCycleName: "最新循環",
    lastComparisonOperator: "公式",
    lastRemarks: "備註",
    lastReportYear: "最新年份",
    lastReportPeriod: "最新季度",
    latestReportYear_Period: "最新執行年份季度",
    lastReportValue: "執行現況",
    kpiCycleName: "循環名稱",
    kpiCycleStartYear: "循環開始年份",
    kpiCycleEndYear: "循環結束年份",
};

export default function KPI() {
    const [activeTab, setActiveTab] = useState("tab_all");
    const [activeType, setActiveType] = useState("type_all");
    const [rowData, setRowData] = useState<any[]>([]);
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [exportMode] = useState<"all" | "failed">("all");

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "檢視績效指標" }
    ];

    const [selection, setSelection] = useState<SelectionPayload>({ orgId: "" });

    const handleQuery = async () => {
        setIsLoading(true);
        const params = {
            organizationId: selection.orgId || undefined,
            startYear: selection.startYear || undefined,
            endYear: selection.endYear || undefined,
            startQuarter: selection.startQuarter || undefined,
            endQuarter: selection.endQuarter || undefined,
            keyword: keyword || undefined,
        };

        try {
            const response = await api.get("/Kpi/display", { params });

            if (response.data?.success) {
                const raw = response.data.data;
                setRowData(raw);
                toast.success(`查詢成功，回傳 ${raw.length} 筆資料`);

                if (raw.length > 0) {
                    const keys = Object.keys(raw[0]).filter(k => k !== 'kpiDatas');
                    const columns = keys.map((key) => ({
                        field: key,
                        headerName: columnTitleMap[key] || key,
                        valueFormatter: (p: any) => p.value ?? "-",
                        cellStyle: { textAlign: "left" },
                        hide: ['id', 'detailItemId', 'isIndicator', 'field', 'productionSite', 'indicatorNumber', 'category', 'lastKpiCycleName', 'lastRemarks', 'lastReportYear', 'lastReportPeriod', 'lastComparisonOperator'].includes(key),
                    }));
                    setColumnDefs(columns);
                }
            } else {
                toast.error("查詢失敗，請稍後再試");
            }
        } catch (error) {
            toast.error("API 發生錯誤");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#4ade80',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Background with gradient */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-slate-50 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Breadcrumbs items={breadcrumbItems}/>
                        <div className="mt-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                績效指標儀表板
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-4"></div>
                        </div>

                    </div>
                </div>

                {/* Main content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Action bar */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-600">
                            </div>
                        </div>

                        <Link href="/kpi/newKpi" tabIndex={-1}>
                            <button
                                type="button"
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-md transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                新增指標
                            </button>
                        </Link>
                    </div>
                    {/* Combined Filter and Category section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Left column - Date filter */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></div>
                                    篩選條件
                                </h3>
                                <div
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <details className="group">
                                        <summary
                                            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                            <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                選擇日期與公司條件
                                            </span>
                                            <svg
                                                className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform duration-200"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </summary>
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                                            <SelectKpiEntriesByDate onSelectionChange={(s) => setSelection(s)}/>
                                        </div>
                                    </details>
                                </div>
                            </div>

                            {/* Right column - Category and Type filters */}
                            <div className="space-y-6 relative">
                                {/* Category selection */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-purple-500 rounded-full mr-3"></div>
                                        類別選擇
                                    </h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                                                    activeTab === category.id
                                                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                                }`}
                                                onClick={() => setActiveTab(category.id)}
                                            >
                                                <span className="text-base">{category.icon}</span>
                                                <span className="truncate">{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type selection */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-purple-500 rounded-full mr-3"></div>
                                        指標類型
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            {id: "type_all", name: "全部", icon: "📋"},
                                            {id: "basic", name: "基礎型指標", icon: "🔧"},
                                            {id: "custom", name: "客製型指標", icon: "⚙️"}
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                                                    activeType === type.id
                                                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md transform scale-105"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                                }`}
                                                onClick={() => setActiveType(type.id)}
                                            >
                                                <span>{type.icon}</span>
                                                <span className="truncate">{type.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Query button positioned at bottom right */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                                        onClick={handleQuery}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none"
                                                     viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                查詢中
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                                </svg>
                                                查詢
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data grid */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                    </svg>
                                    數據總覽
                                </h3>
                                {rowData.length > 0 && (
                                    <div
                                        className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                        </svg>
                                        共 {rowData.length} 筆記錄
                                    </div>
                                )}
                                <input
                                    id="keyword"
                                    name="keyword"
                                    type="text"
                                    aria-label="關鍵字查詢"
                                    placeholder="搜尋指標名稱、編號..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" fill="none"
                                         viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-gray-600 text-lg">正在載入資料...</p>
                                </div>
                            ) : (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <GridComponent
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        activeCategory={activeTab}
                                        activeType={activeType}
                                        columnTitleMap={columnTitleMap}
                                        isLoading={isLoading}
                                        exportMode={exportMode}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}