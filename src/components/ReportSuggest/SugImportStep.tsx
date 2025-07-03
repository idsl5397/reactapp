'use client';
import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectOnlyEnterprise";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { defaultColDef, AG_GRID_LOCALE_TW } from "@/utils/gridConfig";

const api = axios.create({ baseURL: '/proxy' });
export default function SugImportPage() {
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告", href: "/reportEntry" },
        { label: "批次上傳委員建議報告" }
    ];

    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isValid, setIsValid] = useState(false);
    const [orgId, setOrgId] = useState<string>("");

    const toQuarterText = (q: number) => `Q${q}`;   // 1 → "Q1"


    const handleSelectionChange = (payload: SelectionPayload) => {
        console.log("✅ 已選擇公司 ID：", payload.orgId); // ← 加這行
        setOrgId(payload.orgId);
    };

    const handleDownloadTemplate = async (orgId: string) => {
        const res = await api.get(`/Suggest/download-template`, {
            params: {
                organizationId: orgId,
            },
            responseType: 'blob' // 📁 一定要這樣設，才會拿到檔案資料
        });

        const blob = new Blob([res.data], { type: res.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Sug_Template.xlsx';
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
            const res = await api.post('/Suggest/fullpreview-for-report', formData);
            console.log("預覽資料:", res);
            setPreviewData(res.data);
            setIsValid(true);
        } catch (err) {
            console.error(err);
            setIsValid(false);
            alert("解析失敗，請確認格式是否正確");
        }
    };

    const handleConfirmImport = async () => {
        if (!file || !isValid) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('organizationId', orgId);

        try {
            await api.post('/Suggest/fullsubmit-for-report', formData);
            alert("✅ 匯入成功");
            setFile(null);
            setPreviewData([]);
            setIsValid(false);
        } catch (err) {
            console.error(err);
            alert("❌ 匯入失敗");
        }
    };
    const columnDefs = [
        { headerName: "廠商", field: "orgName", flex: 1 },
        { headerName: "日期", field: "date", flex: 1 },
        { headerName: "會議/活動", field: "eventType", flex: 1 },
        { headerName: "類別", field: "suggestType", flex: 1 },
        { headerName: "委員", field: "userName", flex: 1 },
        { headerName: "建議內容", field: "content", flex: 2 },
        { headerName: "負責單位", field: "respDept", flex: 1 },
        { headerName: "是否參採", field: "isAdopted", flex: 1 },
        { headerName: "改善對策/辦理情形", field: "improveDetails", flex: 2 },
        { headerName: "預估人力投入", field: "manpower", flex: 1 },
        { headerName: "預估經費投入", field: "budget", flex: 1 },
        { headerName: "是否完成改善/辦理", field: "completed", flex: 1 },
        { headerName: "預估完成年份", field: "doneYear", flex: 1 },
        { headerName: "預估完成月份", field: "doneMonth", flex: 1 },
        { headerName: "平行展開", field: "parallelExec", flex: 1 },
        { headerName: "展開計畫", field: "execPlan", flex: 2 },
        { headerName: "備註", field: "remark", flex: 2 },
    ];

    const defaultColDef = {
        resizable: true,
        sortable: true,
        filter: true,
    };
    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <h1 className="text-2xl font-bold text-center mb-8 text-base-content">批次上傳委員建議報告</h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectEnterprise onSelectionChange={handleSelectionChange} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
                        <li>請直接對欄位進行修改/填寫</li>
                        <li>僅能修改欄位: 是否參採、改善對策/辦理情形、預估人力投入、預估經費投入、是否完成改善/辦理、預估完成年份、預估完成月份、平行展開、展開計畫、備註</li>
                        <li>請確認填寫內容後送出，避免匯入失敗</li>
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
