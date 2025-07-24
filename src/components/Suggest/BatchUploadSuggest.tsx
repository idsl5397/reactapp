'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const api = axios.create({
    baseURL: `${NPbasePath}/proxy`,
});

export default function BatchUploadSuggest() {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { confirm } = useConfirmDialog(); // ✅ 取 confirm

    // 上傳Excel，取得預覽資料
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        const formData = new FormData();
        formData.append('file', uploadedFile);
        setFile(uploadedFile);

        setIsLoading(true); // ✅ 上傳開始時打開loading

        try {
            const res = await api.post('/suggest/import-preview', formData);
            setPreviewData(res.data); // ✅ 接回來的是解析後的陣列
            console.log(res.data);
            toast.success('檔案解析成功，請確認預覽');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || '檔案解析失敗，請確認格式';
            toast.error(`解析失敗：${msg}`);
            setFile(null);
            setPreviewData([]);
        } finally {
            setIsLoading(false); // ✅ 成功或失敗都要關掉loading
        }
    };

    // 送出預覽資料
    const handleBatchSubmit = async () => {
        if (previewData.length === 0) {
            toast.error('請先上傳並確認預覽資料');
            return;
        }
        const confirmed = await confirm({
            title: "確認送出",
            message: `即將匯入 ${previewData.length} 筆資料，是否確認？`
        });

        if (!confirmed) {
            toast("已取消送出");
            return;
        }
        setIsLoading(true); // ✅ 上傳開始時打開loading
        try {
            const res = await api.post('/suggest/import-confirm', previewData);
            toast.success(res.data.message+res.data.successCount || '批次匯入成功');
            // 匯入成功後清空狀態
            setFile(null);
            setPreviewData([]);
        } catch (err: any) {
            const msg = err.response?.data?.message ?? '匯入失敗，請稍後再試';
            toast.error(msg);
        }finally {
            setIsLoading(false); // ✅ 成功或失敗都要關掉loading
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                    下載 Excel 範本
                </label>
                <a
                    href="/templates/suggest-template.xlsx"
                    download
                    className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white mb-2"
                >
                    下載檔案
                </a>
                <label className="block text-sm font-medium text-gray-900">
                    上傳 Excel 檔案
                </label>

                {/* 隱藏 input，不讓它鋪滿 */}
                <input
                    id="uploadFile"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* 只讓按鈕可以點 */}
                <button
                    type="button"
                    onClick={() => {
                        const input = document.getElementById('uploadFile') as HTMLInputElement;
                        if (input) {
                            input.value = ''; // ✅ 清空 input 的值
                            input.click();     // ✅ 強制重新觸發 onChange
                        }
                    }}
                    className="btn btn-outline btn-primary text-sm px-4 py-2 rounded-md"
                >
                    選擇檔案
                </button>

                {file && (
                    <p className="text-xs text-gray-500 mt-1">
                        已選擇檔案：{file.name}
                    </p>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
                    <span className="ml-4 text-gray-700">資料處理中，請稍後...</span>
                </div>
            ) : (previewData.length > 0 && (
                <div className="border p-4 bg-white rounded-md shadow">
                    <h2 className="text-sm font-semibold mb-2">預覽資料（前 5 筆）</h2>
                    <table className="w-full text-sm text-left">
                        <thead>
                        <tr>
                            <th className="border px-2 py-1">工廠ID</th>
                            <th className="border px-2 py-1">工廠</th>
                            <th className="border px-2 py-1">年/月/日</th>
                            <th className="border px-2 py-1">會議類別</th>
                            <th className="border px-2 py-1">領域</th>
                            <th className="border px-2 py-1">委員</th>
                            <th className="border px-2 py-1">建議內容</th>
                            <th className="border px-2 py-1">建議類別</th>
                            <th className="border px-2 py-1">負責單位</th>
                            <th className="border px-2 py-1">是否參採</th>
                            <th className="border px-2 py-1">投入人力</th>
                            <th className="border px-2 py-1">投入金額</th>
                            <th className="border px-2 py-1">是否完成</th>
                            <th className="border px-2 py-1">完成年</th>
                            <th className="border px-2 py-1">完成月</th>
                            <th className="border px-2 py-1">是否平行展開</th>
                            <th className="border px-2 py-1">平行展開計畫</th>
                            <th className="border px-2 py-1">備註</th>
                        </tr>
                        </thead>
                        <tbody>
                        {previewData.slice(0, 5).map((item, index) => (
                            <tr key={index}>
                                <td className="border px-2 py-1">{item.organizationId}</td>
                                <td className="border px-2 py-1">{item.organization}</td>
                                <td className="border px-2 py-1">{item.date}</td>
                                <td className="border px-2 py-1">{item.suggestEventType}</td>
                                <td className="border px-2 py-1">{item.fieldName}</td>
                                <td className="border px-2 py-1">{item.userName}</td>
                                <td className="border px-2 py-1">{item.suggestionContent}</td>
                                <td className="border px-2 py-1">{item.suggestionType}</td>
                                <td className="border px-2 py-1">{item.respDept}</td>
                                <td className="border px-2 py-1">{item.isAdoptedName}</td>
                                <td className="border px-2 py-1">{item.manpower}</td>
                                <td className="border px-2 py-1">{item.budget}</td>
                                <td className="border px-2 py-1">{item.completedName}</td>
                                <td className="border px-2 py-1">{item.doneYear}</td>
                                <td className="border px-2 py-1">{item.doneMonth}</td>
                                <td className="border px-2 py-1">{item.parallelExecName}</td>
                                <td className="border px-2 py-1">{item.execPlan}</td>
                                <td className="border px-2 py-1">{item.remark}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <button className="btn btn-primary" onClick={handleBatchSubmit}>確認送出</button>
                    </div>
                </div>
            ))}
        </div>
    );
}