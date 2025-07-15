'use client';
import React, { useState } from "react";
import { Download } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectOnlyEnterprise";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import {AG_GRID_LOCALE_TW } from "@/utils/gridConfig";
import {toast, Toaster} from "react-hot-toast";

const api = axios.create({ baseURL: '/proxy' });
export default function BulkImportPage() {
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告", href: "/reportEntry" },
        { label: "批次上傳績效指標報告" }
    ];

    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isValid, setIsValid] = useState(false);
    const [orgId, setOrgId] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1911);
    const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);

    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1911 - i);
    const quarters = [
        { label: "Q1", value: 1 },
        { label: "Q2", value: 2 },
        { label: "Q3", value: 3 },
        { label: "Q4", value: 4 }
    ];
    const toQuarterText = (q: number) => `Q${q}`;   // 1 → "Q1"
    const handleSelectChange = (type: "year" | "quarter", value: string) => {
        if (type === "year") setSelectedYear(parseInt(value));
        else setSelectedQuarter(parseInt(value));
    };

    const handleSelectionChange = (payload: SelectionPayload) => {
        console.log("✅ 已選擇公司 ID：", payload.orgId); // ← 加這行
        setOrgId(payload.orgId);
    };

    const handleDownloadTemplate = async (orgId: string) => {
        const res = await api.get(`/Kpi/download-template`, {
            params: {
                organizationId: orgId,
                year: selectedYear,                 // 可有可無，看後端
                quarter: toQuarterText(selectedQuarter)
            },
            responseType: 'blob' // 📁 一定要這樣設，才會拿到檔案資料
        });

        const blob = new Blob([res.data], { type: res.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'KPI_Template.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        const formData = new FormData();
        formData.append('file', uploadedFile);
        setFile(uploadedFile);
        setIsValid(false);

        try {
            const res = await api.post('/Kpi/fullpreview-for-report', formData);
            setPreviewData(res.data);
            setIsValid(true);
        } catch (err) {
            console.error(err);
            setIsValid(false);
            toast.error("解析失敗，請確認格式是否正確");
        }
    };

    const handleConfirmImport = async () => {
        if (!file || !isValid) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('year', selectedYear.toString());
        formData.append('quarter', toQuarterText(selectedQuarter));   // 👈 轉成 "Q1"
        formData.append('organizationId', orgId);

        try {
            await api.post('/Kpi/fullsubmit-for-report', formData);
            toast.success("✅ 匯入成功");
            setFile(null);
            setPreviewData([]);
            setIsValid(false);
        } catch (err) {
            console.error(err);
            toast.error("❌ 匯入失敗");
        }
    };
    const columnDefs = [
        { headerName: "指標名稱", field: "indicatorName", flex: 1 },
        { headerName: "細項名稱", field: "detailItemName", flex: 1 },
        { headerName: "填報值", field: "reportValue", flex: 1 },
        { headerName: "備註", field: "remarks", flex: 1 },
    ];

    const defaultColDef = {
        resizable: true,
        sortable: true,
        filter: true,
    };
    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <h1 className="text-2xl font-bold text-center mb-8 text-base-content">批次上傳績效指標報告</h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectEnterprise onSelectionChange={handleSelectionChange} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">民國年度</label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedYear}
                                onChange={(e) => handleSelectChange("year", e.target.value)}
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        民國 {year} 年
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">季度</label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedQuarter}
                                onChange={(e) => handleSelectChange("quarter", e.target.value)}
                            >
                                {quarters.map((q) => (
                                    <option key={q.value} value={q.value}>
                                        {q.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card border bg-base-100 shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2">📥 下載目前資料</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        請下載您目前的資料，於 Excel 中進行更新或補充後再上傳。
                    </p>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDownloadTemplate(orgId)}>
                        <Download className="w-4 h-4 mr-2" />
                        下載資料
                    </button>
                </div>

                <div className="card border bg-base-100 shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2">📄 填寫注意事項</h2>
                    <ul className="text-sm list-disc list-inside text-gray-700 space-y-1">
                        <li>請勿更動模板中的欄位名稱與順序</li>
                        <li>請填寫填報值(僅填寫數值)，若無資料請輸入備註</li>
                        <li>請確認填寫數據，避免匯入失敗</li>
                    </ul>
                </div>

                <div className="card border bg-base-100 shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2">📤 上傳檔案</h2>
                    <input type="file" accept=".xlsx" onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-md" />
                    {file && <p className="mt-2 text-sm text-gray-600">已選擇檔案：{file.name}</p>}
                </div>

                {file && (
                    <div className="card border bg-base-100 shadow-md p-4">
                        <h2 className="text-lg font-semibold mb-2">✅ 預覽與匯入確認</h2>
                        <p className="text-sm text-gray-600 mb-2">
                            以下為您上傳的資料預覽，請再次確認內容是否正確。
                        </p>
                        <div
                            className="ag-theme-quartz"
                            style={{height: 400, width: "100%"}}
                        >
                            <AgGridReact
                                localeText={AG_GRID_LOCALE_TW}
                                defaultColDef={defaultColDef}
                                rowData={previewData}
                                columnDefs={columnDefs}
                                pagination={true}
                                paginationPageSize={10}
                                suppressAggFuncInHeader={true}         // ❌ 不顯示彙總函式
                                suppressFieldDotNotation={true}        // ✅ 若你的欄位名稱有 "."，不自動解析成巢狀物件
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-sm mt-2"
                            disabled={!isValid}
                            onClick={handleConfirmImport}
                        >
                            確認匯入
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
