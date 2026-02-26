'use client';
import React, { useState } from "react";
import { Download } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectOnlyEnterprise";
import { AgGridReact } from "ag-grid-react";
import { AG_GRID_LOCALE_TW } from "@/utils/gridConfig";
import { toast, Toaster } from "react-hot-toast";
import api from "@/services/apiService";
import { getAccessToken } from "@/services/serverAuthService";
const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function SugImportPage() {
    const breadcrumbItems = [
        { label: "首頁", href: `${NPbasePath}/home` },
        { label: "填報資料", href: `${NPbasePath}/reportEntry` },
        { label: "批次上傳委員建議報告" }
    ];

    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isValid, setIsValid] = useState(false);
    const [orgId, setOrgId] = useState<string>("");
    const [orgName, setOrgName] = useState<string>("");
    const [confirmed, setConfirmed] = useState(false);
    const [checking, setChecking] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleSelectionChange = (payload: SelectionPayload) => {
        setOrgId(payload.orgId);
        setOrgName(payload.orgName ?? "");
        setConfirmed(false);
        setUploaded(false);
        setFile(null);
        setPreviewData([]);
        setIsValid(false);
    };

    const checkOrg = () => {
        if (!orgId) {
            toast.error("請先選擇公司或工廠！");
            return;
        }
        setChecking(true);
        // 短暫 loading 效果後顯示下方卡片
        setTimeout(() => {
            setConfirmed(true);
            setChecking(false);
            toast.success("確認完成，請繼續操作。");
        }, 300);
    };

    const downloadPdf = async () => {
        setDownloading(true);
        try {
            const token = await getAccessToken();
            const response = await api.get("/Suggest/report-pdf", {
                params: { organizationId: parseInt(orgId) },
                responseType: "blob",
                headers: { Authorization: token ? `Bearer ${token.value}` : "" },
            });
            const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `${orgName}_委員建議報告.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("PDF 下載失敗，請稍後再試");
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadTemplate = async (orgId: string) => {
        const res = await api.get(`/Suggest/download-template`, {
            params: { organizationId: orgId },
            responseType: 'blob'
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
        setUploaded(false);

        try {
            const res = await api.post('/Suggest/fullpreview-for-report', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPreviewData(res.data);
            setIsValid(true);
        } catch (err: any) {
            console.error(err);
            setIsValid(false);
            const msg = err.response?.data?.message ?? err.message ?? "解析失敗，請確認格式是否正確";
            toast.error(`❌ ${msg}`);
        }
        e.target.value = "";
    };

    const handleConfirmImport = async () => {
        if (!file || !isValid) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('organizationId', orgId);

        try {
            await api.post('/Suggest/fullsubmit-for-report', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("匯入成功");
            setFile(null);
            setPreviewData([]);
            setIsValid(false);
            setUploaded(true);
        } catch (err) {
            console.error(err);
            toast.error("❌ 匯入失敗");
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
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">批次上傳委員建議報告</h1>

                {/* 機構選擇 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectEnterprise onSelectionChange={handleSelectionChange} />
                </div>

                {/* 確認選擇按鈕 */}
                <div className="flex justify-end">
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={checkOrg}
                        disabled={checking || !orgId}
                    >
                        {checking ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : "確認選擇"}
                    </button>
                </div>

                {confirmed && (<>
                    {/* 匯入成功後顯示 PDF 下載 */}
                    {uploaded && (
                        <div className="bg-green-50 border border-green-300 rounded-2xl p-8 text-center space-y-4">
                            <div className="text-5xl">✅</div>
                            <h2 className="text-xl font-bold text-green-800">匯入成功</h2>
                            <p className="text-green-700">
                                <strong>{orgName || "已選擇公司"}</strong> 的委員建議報告已成功匯入。
                            </p>
                            <div className="flex justify-center gap-3 flex-wrap">
                                <button
                                    className="btn btn-primary"
                                    disabled={downloading}
                                    onClick={downloadPdf}
                                >
                                    {downloading ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : "📄 下載 PDF 報告"}
                                </button>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setUploaded(false)}
                                >
                                    重新上傳
                                </button>
                            </div>
                        </div>
                    )}

                    {!uploaded && (<>
                        <div className="card border bg-white shadow-md p-4">
                            <h2 className="text-lg font-semibold mb-2 text-gray-900">📥 下載目前資料</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                請下載您目前的資料，於 Excel 中進行更新或補充後再上傳。
                            </p>
                            <button
                                className="btn btn-outline btn-sm text-black border-black bg-white hover:bg-white hover:text-black hover:border-black"
                                onClick={() => handleDownloadTemplate(orgId)}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                下載資料
                            </button>
                        </div>

                        <div className="card border bg-white shadow-md p-4">
                            <h2 className="text-lg font-semibold mb-2 text-gray-900">📄 填寫注意事項</h2>
                            <ul className="text-sm list-disc list-inside text-gray-700 space-y-1">
                                <li>請勿更動模板中的欄位名稱與順序</li>
                                <li>請直接對欄位進行修改/填寫</li>
                                <li>僅能修改欄位: 是否參採、改善對策/辦理情形、預估人力投入、預估經費投入、是否完成改善/辦理、預估完成年份、預估完成月份、平行展開、展開計畫、備註</li>
                                <li>請確認填寫內容後送出，避免匯入失敗</li>
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
                                <div className="ag-theme-quartz" style={{ height: 400, width: "100%" }}>
                                    <AgGridReact
                                        localeText={AG_GRID_LOCALE_TW}
                                        defaultColDef={defaultColDef}
                                        rowData={previewData}
                                        columnDefs={columnDefs}
                                        pagination={true}
                                        paginationPageSize={10}
                                        suppressAggFuncInHeader={true}
                                        suppressFieldDotNotation={true}
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
                    </>)}
                </>)}
            </div>
        </>
    );
}
