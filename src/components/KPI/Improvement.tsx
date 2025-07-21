'use client';
import React, { useState, useEffect, useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectOnlyEnterprise";
import { getAccessToken } from "@/services/serverAuthService";
import {TrashIcon, DocumentArrowUpIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon} from "@heroicons/react/16/solid";
import {CloudArrowUpIcon, DocumentTextIcon, CalendarDaysIcon, BuildingOfficeIcon} from "@heroicons/react/24/outline";
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
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

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
        { label: "第一季", value: 1 },
        { label: "第二季", value: 2 },
        { label: "第三季", value: 3 },
        { label: "第四季", value: 4 }
    ];

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "填報資料" , href: "/reportEntry" },
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setUploadedFiles(Array.from(files));
        }
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
                fetchFiles();
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
            await fetchFiles();
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

            {/* 背景 */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 -z-10" />

            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>

            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-8 lg:px-8">
                <div className="space-y-8 w-full max-w-6xl mx-auto">

                    {/* 頁面標題 */}
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <h1 className="text-center text-3xl sm:text-4xl font-bold text-gray-900">
                                改善報告書
                            </h1>
                        </div>
                        <div
                            className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
                    </div>

                    {/* 步驟指示器 */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${orgId ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {orgId ? <CheckCircleIcon className="w-5 h-5" /> : '1'}
                                </div>
                                <span className="text-sm font-medium">選擇公司</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${uploadedFiles.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {uploadedFiles.length > 0 ? <CheckCircleIcon className="w-5 h-5" /> : '2'}
                                </div>
                                <span className="text-sm font-medium">上傳檔案</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${canSubmit ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                    3
                                </div>
                                <span className="text-sm font-medium">確認送出</span>
                            </div>
                        </div>
                    </div>

                    {/* 選擇公司和期間 */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-800">基本資訊設定</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">選擇公司/工廠</label>
                                <SelectEnterprise onSelectionChange={handleSelectionChange}/>
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                                        民國年度
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <ClockIcon className="w-4 h-4 inline mr-1" />
                                        報告季度
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

                    {/* 歷史檔案 */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-xl font-semibold text-gray-800">歷史報告檔案</h2>
                        </div>

                        {Object.keys(historicalFilesByPeriod).length === 0 ? (
                            <div className="text-center py-12">
                                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">尚無已上傳的歷史報告</p>
                                <p className="text-gray-400 text-sm mt-2">上傳第一份報告後，檔案將會顯示在此處</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(historicalFilesByPeriod).map(([period, files]) => (
                                    <div key={period} className="border border-gray-200 rounded-xl p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {period === "其他" ? "其他檔案" : `民國 ${period.replace('_', ' 年 ')}`}
                                            </h3>
                                            <span className="text-sm text-gray-500">({files.length} 個檔案)</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {files.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <DocumentArrowUpIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                        <a
                                                            href={`/uploads/${file}`}
                                                            target="_blank"
                                                            download={file}
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 font-medium truncate"
                                                            title={file}
                                                        >
                                                            {file}
                                                        </a>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteFile(period, file)}
                                                        className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="刪除檔案"
                                                    >
                                                        <TrashIcon className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 檔案上傳 */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-800">上傳新報告</h2>
                        </div>

                        <div className="space-y-6">
                            <div
                                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                                    isDragOver
                                        ? 'border-blue-500 bg-blue-50'
                                        : uploadedFiles.length > 0
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploadedFiles.length > 0 ? (
                                            <>
                                                <CheckCircleIcon className="w-12 h-12 text-green-500 mb-3" />
                                                <p className="text-lg font-medium text-green-700">
                                                    檔案已選擇
                                                </p>
                                                <p className="text-sm text-green-600 mt-1">
                                                    {uploadedFiles[0].name}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-3" />
                                                <p className="text-lg font-medium text-gray-700">
                                                    拖放檔案到此處或點擊選擇
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    支援 PDF、Word、Excel 等格式
                                                </p>
                                            </>
                                        )}
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
                                </label>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        <span className="text-green-800 font-medium">已選擇檔案：</span>
                                        <span className="text-green-700">{uploadedFiles[0].name}</span>
                                        <button
                                            onClick={() => setUploadedFiles([])}
                                            className="ml-auto text-green-600 hover:text-green-800"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 確認送出 */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <ExclamationCircleIcon className="w-6 h-6 text-amber-600" />
                            <h2 className="text-xl font-semibold text-gray-800">確認送出</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-medium text-gray-800 mb-4">提交資訊確認</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${orgId ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-gray-700">選擇公司：</span>
                                        <span className={orgId ? 'text-green-700 font-medium' : 'text-red-700'}>
                                            {orgId ? '已選擇' : '未選擇'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-gray-700">報告期間：</span>
                                        <span className="text-blue-700 font-medium">
                                            民國 {selectedYear} 年 第{selectedQuarter}季
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 md:col-span-2">
                                        <div className={`w-3 h-3 rounded-full ${uploadedFiles.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-gray-700">上傳檔案：</span>
                                        <span className={uploadedFiles.length > 0 ? 'text-green-700 font-medium' : 'text-red-700'}>
                                            {uploadedFiles.length > 0 ? uploadedFiles[0].name : '未選擇檔案'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        canSubmit 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={!canSubmit || isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>送出中...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <DocumentArrowUpIcon className="w-5 h-5" />
                                            <span>確認送出</span>
                                        </div>
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