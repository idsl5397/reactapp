'use client';
import React, { useState } from "react";
import { Download } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectOnlyEnterprise";
import { AgGridReact } from "ag-grid-react";
import {AG_GRID_LOCALE_TW } from "@/utils/gridConfig";
import {toast, Toaster} from "react-hot-toast";
import api from "@/services/apiService"
import {getAccessToken} from "@/services/serverAuthService";
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import {ChevronDownIcon} from "@heroicons/react/16/solid";
const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function BulkImportPage() {
    const breadcrumbItems = [
        { label: "首頁", href: `${NPbasePath}/home` },
        { label: "填報資料", href: `${NPbasePath}/reportEntry` },
        { label: "批次上傳績效指標報告" }
    ];

    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isValid, setIsValid] = useState(false);
    const [orgId, setOrgId] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1911);
    const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);
    const { confirm } = useConfirmDialog();

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
            const token = await getAccessToken();
            const res = await api.post('/Kpi/fullpreview-for-report', formData,
                {headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token?.value}`,
                }});
            setPreviewData(res.data);
            setIsValid(true);
        } catch (err: any) {
            console.error("📛 錯誤訊息：", err);
            setPreviewData([]);
            setIsValid(false);

            if (err.response) {
                // 伺服器回應錯誤（如 400, 500）
                console.error("📡 伺服器回應錯誤：", err.response);
                console.error("🔢 狀態碼：", err.response.status);
                console.error("📦 回應資料：", err.response.data);

                const statusCode = err.response.status;
                const message = err.response.data?.message || "解析失敗";
                const errorList: string[] = err.response.data?.errors || [];

                if (Array.isArray(errorList) && errorList.length > 0) {
                    console.error("🔍 驗證錯誤列表：", errorList);

                    const errorText = errorList.join('\n');

                    await confirm({
                        title: `❌ 匯入錯誤（${statusCode}）`,
                        message: `${message}\n\n${errorText}`,
                        showCancel: false // ✅ 只顯示「確認」按鈕
                    });

                } else {
                    await confirm({
                        title: `❌ 伺服器錯誤（${statusCode}）`,
                        message: message,
                        showCancel: false
                    });
                }

            } else if (err.request) {
                // 請求已發送但無回應（如 CORS、網路斷線）
                console.error("📭 沒有回應的請求：", err.request);
                toast.error("❌ 未收到伺服器回應，請檢查網路或伺服器狀態");
            } else {
                // 請求建立錯誤（Axios 設定錯等）
                console.error("⚙️ 設定錯誤：", err.message);
                toast.error(`❌ 請求建立失敗：${err.message}`);
            }
        }
        e.target.value = "";
    };

    const handleConfirmImport = async () => {
        const isConfirmed = await confirm({
            title: "上傳確認",
            message: "確定要上傳這批資料嗎？此操作無法復原。",
        });
        if (isConfirmed) {
            if (!file || !isValid) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('year', selectedYear.toString());
            formData.append('quarter', toQuarterText(selectedQuarter));   // 👈 轉成 "Q1"
            formData.append('organizationId', orgId);

            try {
                await api.post('/Kpi/fullsubmit-for-report', formData);
                toast.success("匯入成功");
                setFile(null);
                setPreviewData([]);
                setIsValid(false);
            } catch (err: any) {
                console.error("📛 匯入發生錯誤：", err);

                if (err.response) {
                    console.error("📡 伺服器回應錯誤：", err.response);
                    console.error("🔢 狀態碼：", err.response.status);
                    console.error("📦 回應資料：", err.response.data);
                    toast.error(`❌ 匯入失敗（${err.response.status}）：${err.response.data?.message || '請檢查格式或資料內容'}`);
                } else if (err.request) {
                    console.error("📭 沒有回應的請求：", err.request);
                    toast.error("❌ 沒有收到伺服器回應，請檢查網路或 API 設定");
                } else {
                    console.error("⚙️ 錯誤訊息：", err.message);
                    toast.error(`❌ 匯入失敗：${err.message}`);
                }
            }
            console.log("使用者已確認上傳");
        } else {
            console.log("使用者取消上傳");
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
                <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">批次上傳績效指標報告</h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectEnterprise onSelectionChange={handleSelectionChange} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">民國年度</label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="selectedYear"
                                    name="selectedYear"
                                    aria-label="選擇年度(民國)"
                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                    value={selectedYear}
                                    onChange={(e) => handleSelectChange("year", e.target.value)}
                                >
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>
                                            民國 {year} 年
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                />
                            </div>

                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">季度</label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="selectedQuarter"
                                    name="selectedQuarter"
                                    aria-label="季度"
                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                    value={selectedQuarter}
                                    onChange={(e) => handleSelectChange("quarter", e.target.value)}
                                >
                                    {quarters.map((q) => (
                                        <option key={q.value} value={q.value}>
                                            {q.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card border bg-white shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">📥 下載目前資料</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        請下載您目前的資料，於 Excel 中進行更新或補充後再上傳。
                    </p>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDownloadTemplate(orgId)}>
                        <Download className="w-4 h-4 mr-2" />
                        下載資料
                    </button>
                </div>

                <div className="card border bg-white shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">📄 填寫注意事項</h2>
                    <ul className="text-sm list-disc list-inside text-gray-700 space-y-1">
                        <li>請勿更動模板中的欄位名稱與順序</li>
                        <li>請填寫填報值(僅填寫數值)，若無資料請輸入備註</li>
                        <li>請確認填寫數據，避免匯入失敗</li>
                    </ul>
                </div>

                <div className="card border bg-white shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">📤 上傳檔案</h2>
                    <input
                        id="file"
                        name="file"
                        aria-label="上傳檔案"
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileChange}
                        className="file-input file-input-bordered w-full max-w-md text-black border-black bg-white hover:bg-white hover:text-black hover:border-black"
                    />
                    {file && (
                        <p className="mt-2 text-sm text-gray-600">
                            已選擇檔案：{file.name}
                        </p>
                    )}
                </div>

                {file && (
                    <div className="card border bg-white shadow-md p-4">
                        <h2 className="text-lg font-semibold mb-2 text-gray-900">✅ 預覽與匯入確認</h2>
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
