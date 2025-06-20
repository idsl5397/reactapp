'use client';
import React, { useState } from "react";
import { Download} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function BulkImportPage() {
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告" , href: "/reportEntry" },
        { label: "批次上傳績效指標報告"}
    ];
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isValid, setIsValid] = useState(false);

    const handleDownloadTemplate = () => {
        // 下載目前資料
        window.open('/api/kpi/download-template', '_blank');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploaded = e.target.files?.[0];
        setFile(uploaded || null);

        // TODO: 呼叫後端預覽 API，回傳解析後的預覽資料與格式檢查結果
        // setPreviewData(...); setIsValid(true/false)
    };

    const handleConfirmImport = () => {
        if (isValid && file) {
            // TODO: 呼叫後端匯入 API
        }
    };

    return (
        <>
        <div className="w-full flex justify-start">
            <Breadcrumbs items={breadcrumbItems}/>
        </div>
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold text-center mb-8 text-base-content">批次上傳績效指標報告</h1>


                {/* 1️⃣ 下載資料區 */}
                <div className="card border bg-base-100 shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2">📥 下載目前資料</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        請下載您目前的資料，於 Excel 中進行更新或補充後再上傳。
                    </p>
                    <button className="btn btn-outline btn-sm" onClick={handleDownloadTemplate}>
                        <Download className="w-4 h-4 mr-2"/>
                        下載資料
                    </button>
                </div>

                {/* 2️⃣ 說明區 */}
                <div className="card border bg-base-100 shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2">📄 填寫注意事項</h2>
                    <ul className="text-sm list-disc list-inside text-gray-700 space-y-1">
                        <li>請勿更動模板中的欄位名稱</li>
                        <li>數值欄請勿留空，若無資料請填入 0 或 N/A</li>
                        <li>日期格式請使用 YYYY-MM-DD，例如 2025-06-01</li>
                        <li>請確認填寫單位與數據一致性，避免匯入錯誤</li>
                    </ul>
                </div>

                {/* 3️⃣ 上傳區 */}
                <div className="card border bg-base-100 shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2">📤 上傳檔案</h2>
                    <input type="file" accept=".xlsx" onChange={handleFileChange}
                           className="file-input file-input-bordered w-full max-w-md"/>
                    {file && <p className="mt-2 text-sm text-gray-600">已選擇檔案：{file.name}</p>}
                </div>

                {/* 4️⃣ 預覽與確認 */}
                {file && (
                    <div className="card border bg-base-100 shadow-md p-4">
                        <h2 className="text-lg font-semibold mb-2">✅ 預覽與匯入確認</h2>
                        {/* 這裡可以用 AG Grid 或 Table 呈現 previewData */}
                        <p className="text-sm text-gray-600 mb-2">
                            以下為您上傳的資料預覽，請再次確認內容是否正確。
                        </p>
                        <button
                            className="btn btn-primary btn-sm"
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