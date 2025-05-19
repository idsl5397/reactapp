'use client';

import React, { useState } from 'react';
import GridComponent from "@/components/KpiAggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectEnterprise";
import Link from 'next/link';
import axios from "axios";
import { ColDef } from "ag-grid-community";
import { Toaster, toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: "/proxy",
});

const categories = [
    { id: "tab_all", name: "全部類別" },
    { id: "製程安全管理", name: "製程安全管理(PSM)" },
    { id: "能源管理", name: "能源管理(EP)" },
    { id: "消防管理", name: "消防管理(FR)" },
    { id: "環保管理", name: "環保管理(ECO)" }
];

const columnTitleMap: Record<string, string> = {
    company: "工廠名稱",
    productionSite: "工場/製程區",
    category: "指標類型",
    field: "所屬類型",
    indicatorNumber: "指標編號",
    indicatorName: "指標名稱",
    detailItemName: "指標細項名稱",
    unit: "單位",
    isApplied: "是否應用",
    baselineYear: "基線年",
    baselineValue: "基線值",
    targetValue: "目標值",
    remarks: "備註",
    reports: "歷史所有執行狀況",
    comparisonOperator: "公式",
    lastBaselineYear: "最新基線年",
    lastBaselineValue: "最新基線值",
    lastTargetValue: "最新目標值",
    lastKpiCycleName: "最新循環",
    lastComparisonOperator: "公式",
    lastRemarks: "備註",
    lastReportYear: "最新年份",
    lastReportPeriod: "最新季度",
    latestReportYear_Period: "最新執行年份季度",
    lastReportValue: "最新執行狀況",
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
        };

        try {
            const response = await api.get("/Kpi/display", { params });

            if (response.data?.success) {
                const raw = response.data.data;
                setRowData(raw);
                console.log(raw);
                toast.success(`查詢成功，回傳 ${raw.length} 筆資料`);

                if (raw.length > 0) {
                    const keys = Object.keys(raw[0]).filter(k => k !== 'kpiDatas');
                    const columns = keys.map((key) => ({
                        field: key,
                        headerName: columnTitleMap[key] || key,
                        valueFormatter: (p: any) => p.value ?? "-",
                        cellStyle: { textAlign: "left" },
                        hide: key === 'id' || key === 'detailItemId',
                    }));
                    setColumnDefs(columns);
                }
            } else {
                toast.error("查詢失敗，請稍後再試");
            }
        } catch (error) {
            toast.error("API 發生錯誤");
        }finally {
            setIsLoading(false); // ✅ 不管成功或失敗，最後一定關掉 loading
        }
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="relative space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        績效指標
                    </h1>
                    <div className="absolute top-0 right-0 z-10 mt-4 mr-4">
                        <Link href="/kpi/newKpi" tabIndex={-1}>
                            <button
                                type="button"
                                className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            >
                                新增指標
                            </button>
                        </Link>
                    </div>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <SelectEnterprise onSelectionChange={(s) => setSelection(s)}/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-x-8">
                        <button
                            type="button"
                            className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            onClick={handleQuery}
                        >
                            {isLoading ? '查詢中...' : '查詢'}
                        </button>
                    </div>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="w-full mx-auto">
                            <div
                                className="tabs tabs-boxed bg-base-200 p-2 rounded-lg flex flex-wrap justify-center gap-2 overflow-x-auto">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        className={`tab ${activeTab === category.id ? "tab-active bg-primary text-white" : "text-gray-700"} text-base`}
                                        onClick={() => setActiveTab(category.id)}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                            <div className="join flex flex-col sm:flex-row justify-center mt-4 gap-2 sm:gap-0 ">
                                <button
                                    className={`join-item btn ${activeType === "type_all" ? "btn-active btn-primary" : "btn-ghost"} text-base`}
                                    onClick={() => setActiveType("type_all")}
                                >
                                    全部
                                </button>
                                <button
                                    className={`join-item btn ${activeType === "basic" ? "btn-active btn-primary" : "btn-ghost"} text-base`}
                                    onClick={() => setActiveType("basic")}
                                >
                                    基礎型指標
                                </button>
                                <button
                                    className={`join-item btn ${activeType === "custom" ? "btn-active btn-primary" : "btn-ghost"} text-base`}
                                    onClick={() => setActiveType("custom")}
                                >
                                    客製型指標
                                </button>
                            </div>
                            <div className="card bg-base-100 shadow-xl p-6 mt-6">
                                {isLoading ? (
                                    <div className="text-center text-gray-500">資料載入中…</div>
                                ) : (
                                    <GridComponent
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        activeCategory={activeTab}
                                        activeType={activeType}
                                        columnTitleMap={columnTitleMap}
                                        isLoading={isLoading}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}