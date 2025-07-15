'use client';
import React, { useState, useEffect, useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectOnlyEnterprise";
import { getAccessToken } from "@/services/serverAuthService";
import {TrashIcon} from "@heroicons/react/16/solid";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: '/proxy',
});

export default function Improvement(){
    const [orgId, setOrgId] = useState<string>("");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [historicalFiles, setHistoricalFiles] = useState<string[]>([]);

    const fetchFiles = async (orgIdParam?: string) => {
        try {
            const response = await api.get("/Improvement/list-files", {
                params: {
                    orgId: orgIdParam || orgId,
                },
            });
            setHistoricalFiles(response.data.files);
        } catch (error) {
            console.error("取得檔案失敗：", error);
        }
    };

    const historicalFilesByPeriod = useMemo(() => {
        const grouped: { [key: string]: string[] } = {};
        historicalFiles.forEach((file) => {
            const match = file.match(/-(\d{3})年-Q(\d)/);
            if (match) {
                const year = match[1];
                const quarter = match[2];
                const periodKey = `${year}_Q${quarter}`;
                if (!grouped[periodKey]) grouped[periodKey] = [];
                grouped[periodKey].push(file);
            } else {
                if (!grouped["其他"]) grouped["其他"] = [];
                grouped["其他"].push(file);
            }
        });
        return grouped;
    }, [historicalFiles]);

    useEffect(() => {
        if (!orgId) return;
        fetchFiles(orgId);
    }, [orgId]);

    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1911);
    const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);

    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1911 - i);
    const quarters = [
        { label: "Q1", value: 1 },
        { label: "Q2", value: 2 },
        { label: "Q3", value: 3 },
        { label: "Q4", value: 4 }
    ];

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告" , href: "/reportEntry" },
        { label: "改善報告書" }
    ];

    const handleSelectionChange = (payload: SelectionPayload) => {
        console.log("✅ 已選擇公司 ID：", payload.orgId);
        setOrgId(payload.orgId);
    };

    const handleSelectChange = (type: "year" | "quarter", value: string) => {
        if (type === "year") setSelectedYear(parseInt(value));
        else setSelectedQuarter(parseInt(value));
    };

    const handleSubmit = async () => {
        if (!orgId) {
            toast.error("請先選擇公司/工廠");
            return;
        }

        if (uploadedFiles.length === 0) {
            toast.error("請先上傳檔案");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("orgId", orgId);
            formData.append("year", selectedYear.toString());
            formData.append("quarter", selectedQuarter.toString());

            formData.append("file", uploadedFiles[0], uploadedFiles[0].name);
            const token = await getAccessToken();
            const response = await api.post("/Improvement/submit-report", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: token ? `Bearer ${token.value}` : '',
                },
            });
            console.log("🔥 上傳時使用的 token：", token);
            if (response.data.success) {
                toast.success("改善報告書提交成功！");
                fetchFiles(); // ⬅️ 上傳成功後重新撈取資料
                setUploadedFiles([]);
            } else {
                toast.error("提交失敗：", response.data.message);
            }
        } catch (error) {
            console.error("提交失敗：", error);
            toast.error("提交失敗，請稍後再試");
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = orgId && uploadedFiles.length > 0;

    const handleDeleteFile = async (period: string, fileName: string) => {
        try {
            await api.delete('/Improvement/delete-file', {
                params: { fileName },
            });
            await fetchFiles(); // ⬅️ 刪除後重新抓檔案列表
            toast.success("檔案已成功刪除");
        } catch (err) {
            console.error("刪除失敗：", err);

            const message = axios.isAxiosError(err)
                ? err.response?.data?.message || "伺服器錯誤"
                : "未知錯誤";

            toast.error(`刪除失敗：${message}`);
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
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        改善報告書
                    </h1>
                    <div className="max-w-5xl mx-auto p-6 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <SelectEnterprise onSelectionChange={handleSelectionChange}/>
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
                    </div>
                    <div className="card bg-base-100 shadow-xl p-6 mx-auto w-4/5 max-w-screen-lg mb-6">
                        <p className="font-semibold mb-2">顯示歷史檔案</p>
                        {Object.keys(historicalFilesByPeriod).length === 0 ? (
                            <p className="text-sm text-gray-500">尚無已上傳的歷史報告</p>
                        ) : (
                            Object.entries(historicalFilesByPeriod).map(([period, files]) => (
                                <div key={period} className="mb-4">
                                    <h4 className="text-md font-semibold text-gray-700 mb-1">📅 {period}</h4>
                                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                        {files.map((file, idx) => (
                                            <li key={idx} className="flex items-center justify-between">
                                                <a href={`/uploads/${file}`} target="_blank"
                                                   download={file}
                                                   rel="noopener noreferrer"
                                                   className="flex-1 truncate text-blue-700 hover:underline">
                                                    {file}
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteFile(period, file)}
                                                    className="ml-3 text-red-600 hover:text-red-800"
                                                    title="刪除"
                                                >
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="card bg-base-100 shadow-xl p-6 mx-auto w-4/5 max-w-screen-lg mb-6">
                        <p>上傳檔案</p>
                        <div className="flex items-center justify-center w-full">
                            <label
                                className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">點擊上傳</span> 或拖放檔案至此
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = e.target.files;
                                        if (files && files.length > 0) {
                                            setUploadedFiles(Array.from(files));
                                        }
                                    }}
                                />
                                <div className="absolute inset-0"/>
                            </label>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl p-6 mx-auto w-4/5 max-w-screen-lg mb-6">
                        <div className="flex flex-col space-y-4">
                            <h3 className="font-semibold text-lg">確認送出</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>📋 選擇公司：{orgId ? "✅ 已選擇" : "❌ 未選擇"}</p>
                                <p>📅 報告期間：民國 {selectedYear} 年 Q{selectedQuarter}</p>
                                <p>📁 上傳檔案：{uploadedFiles.map(file => file.name).join(', ')}</p>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className={`btn ${canSubmit ? "btn-primary" : "btn-disabled"}`}
                                    disabled={!canSubmit || isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            送出中...
                                        </>
                                    ) : (
                                        "確認送出"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </>
    );
}
