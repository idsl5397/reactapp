'use client';

import React, {useState} from 'react';
import GridComponent from "@/components/aggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, {SelectionPayload} from "@/components/select/selectEnterprise";
import Link from 'next/link';
import axios from "axios";
import { ColDef } from "ag-grid-community";
import { Toaster, toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: "/proxy",
});
// const rowData = [
//     {
//         id: 1,
//         company: "中油石化事業部",
//         factory: "新三輕組",
//         indicator: "製程安全資訊之完整性",
//         indicatorDetail: "實際具備製程安全資訊文件數",
//         department: "件",
//         isApplied: "是",
//         baselineYear: "110年",
//         baselineValue: "18",
//         q1Status: "16",
//         q3Status: "18",
//         targetValue: "18"
//     },
//     {
//         id: 2,
//         company: "中油石化事業部",
//         factory: "新三輕組",
//         indicator: "製程安全資訊之完整性",
//         indicatorDetail: "勞工參與製程安全管理提案已改善之件數",
//         department: "件",
//         isApplied: "是",
//         baselineYear: "110年",
//         baselineValue: "199",
//         q1Status: "160",
//         q3Status: "94",
//         targetValue: "60"
//     },
//     {
//         id: 3,
//         company: "中油石化事業部",
//         factory: "新三輕組",
//         indicator: "製程安全資訊之完整性",
//         indicatorDetail: "實際參與製程安全管理活動總人次",
//         department: "人",
//         isApplied: "是",
//         baselineYear: "110年",
//         baselineValue: "129",
//         q1Status: "129",
//         q3Status: "129",
//         targetValue: "129"
//     }
// ];

//
// const columnDefs = [
//     { field: "id", headerName: "編號" },
//     { field: "company", headerName: "公司" },
//     { field: "factory", headerName: "工廠/製程廠" },
//     { field: "indicator", headerName: "指標項目" },
//     { field: "indicatorDetail", headerName: "指標細項" },
//     { field: "department", headerName: "單位" },
//     { field: "isApplied", headerName: "是否應用" },
//     { field: "baselineYear", headerName: "基線值數據年限" },
//     { field: "baselineValue", headerName: "基線值" },
//     { field: "q1Status", headerName: "111年Q1執行狀況" },
//     { field: "q3Status", headerName: "111年Q3執行狀況" },
//     { field: "targetValue", headerName: "目標值" }
// ];

const categories = [
    { id: "tab_all", name: "全部類別" },
    { id: "製程安全管理", name: "製程安全管理(PSM)" },
    { id: "能源管理", name: "能源管理(EP)" },
    { id: "消防管理", name: "消防管理(FR)" },
    { id: "環保管理", name: "環保管理(ECO)" }
];

const columnTitleMap: Record<string, string> = {
    company: "公司名稱",
    productionSiteName:"工廠/製程廠",
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
};

export default function KPI() {
    const [activeTab, setActiveTab] = useState("tab_all");
    const [activeType, setActiveType] = useState("type_all"); // 'basic' or 'custom'
    const [rowData, setRowData] = useState<any[]>([]);
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "檢視績效指標" }
    ];

    const [selection, setSelection] = useState<SelectionPayload>({ orgId: "" });

    // 攤平 reports 為 report_111_Y: value 格式
    const flattenReports = (data: any[]) => {
        const allPeriods: string[] = [];

        const flatData = data.map((item) => {
            const flattened = { ...item };

            item.reports?.forEach((r: any) => {
                const key = `${r.year}_${r.period}_執行狀況`;
                flattened[key] = r.kpiReportValue;

                if (!allPeriods.includes(key)) {
                    allPeriods.push(key);
                }
            });

            delete flattened.reports;
            return flattened;
        });

        return { flatData, allPeriods };
    };

    const handleQuery = async () => {
        const params = {
            organizationId: selection.orgId || undefined,
            startYear: selection.startYear || undefined,
            endYear: selection.endYear || undefined,
        };

        try {
            const response = await api.get("/Kpi/display", { params });

            if (response.data?.success) {
                const raw = response.data.data;
                const { flatData, allPeriods } = flattenReports(raw);
                setRowData(flatData);
                toast.success(`查詢成功，回傳 ${flatData.length} 筆資料`);
                console.log(flatData);
                if (flatData.length > 0) {
                    const baseKeys = Object.keys(flatData[0]).filter(
                        (key) => !key.includes("執行狀況")
                    );

                    const baseColumns = baseKeys.map((key) => ({
                        field: key,
                        headerName: columnTitleMap[key] || key,
                    }));

                    const reportColumns = allPeriods.map((key) => ({
                        field: key,
                        headerName: key, // 顯示為 111_Y_執行狀況
                        valueFormatter: (p: any) => p.value ?? "-",
                        cellStyle: { textAlign: "right" },
                        width: 140,
                    }));

                    setColumnDefs([...baseColumns, ...reportColumns]);
                }
            } else {
                console.error("查詢失敗：", response.data);
                toast.error("查詢失敗，請稍後再試");
            }
        } catch (error) {
            console.error("API 錯誤：", error);
            toast.error("API 發生錯誤");
        }
    };
    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
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
                    <SelectEnterprise onSelectionChange={(s) => setSelection(s)} />
                    <div className="flex justify-end gap-x-8">
                        <button
                            type="button"
                            className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            onClick={handleQuery}
                        >
                            查詢
                        </button>
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
                                    className={`join-item btn ${activeType === "type_all" ? "btn-active btn-primary" : "btn-ghost"}`}
                                    onClick={() => setActiveType("type_all")}
                                >
                                    全部
                                </button>
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
                                <GridComponent
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    activeCategory={activeTab}   // 例如 tab_all、PSM、EP...
                                    activeType={activeType}      // 例如 type_all、basic、custom
                                />
                            </div>


                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};