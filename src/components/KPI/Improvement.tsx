'use client';
import React, { useState, useEffect } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectOnlyEnterprise";
import { getAccessToken } from "@/services/serverAuthService";
import axios from "axios";

const api = axios.create({
    baseURL: '/proxy',
});
export default function Improvement(){
    const [orgId, setOrgId] = useState<string>("");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!orgId) return;

        const fetchFiles = async () => {
            try {
                const response = await api.get("/Improvement/list-files", {
                    params: {
                        orgId,
                    },
                });
                setUploadedFiles(response.data.files); // 假設是 { files: ["檔名1.pdf", "檔名2.pdf"] }
            } catch (error) {
                console.error("取得檔案失敗：", error);
            }
        };

        fetchFiles();
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

    // 確認送出功能
    const handleSubmit = async () => {
        if (!orgId) {
            alert("請先選擇公司/工廠");
            return;
        }

        if (uploadedFiles.length === 0) {
            alert("請先上傳檔案");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("orgId", orgId);
            formData.append("year", selectedYear.toString());
            formData.append("quarter", selectedQuarter.toString());

            // 這裡只示範單一檔案上傳
            const fileBlob = new Blob([uploadedFiles[0]]);
            formData.append("file", uploadedFiles[0], uploadedFiles[0].name);
            const token = await getAccessToken(); // 取得 Cookie
            const response = await api.post("/Improvement/submit-report", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    // Authorization: token ? `Bearer ${token.value}` : '', // ✅ 必須加上 JWT
                },
            });
            console.log("🔥 上傳時使用的 token：", token);
            if (response.data.success) {
                alert("改善報告書提交成功！");
            } else {
                alert("提交失敗：" + response.data.message);
            }
        } catch (error) {
            console.error("提交失敗：", error);
            alert("提交失敗，請稍後再試");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 檢查是否可以提交
    const canSubmit = orgId && uploadedFiles.length > 0;

    return (
        <>
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
                        <p>上傳檔案</p>
                        <div className="flex items-center justify-center w-full">
                            <label
                                className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {/*<Upload className="w-10 h-10 mb-3 text-gray-400" />*/}
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
                                            setUploadedFiles(Array.from(files));  // ✅ 取出 File[] 放進 state
                                        }
                                    }}
                                />
                                <div className="absolute inset-0"/>
                            </label>
                        </div>
                    </div>

                    {/* ✅ 確認送出放這裡 */}
                    <div className="card bg-base-100 shadow-xl p-6 mx-auto w-4/5 max-w-screen-lg mb-6">
                        <div className="flex flex-col space-y-4">
                            <h3 className="font-semibold text-lg">確認送出</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>📋 選擇公司：{orgId ? "✅ 已選擇" : "❌ 未選擇"}</p>
                                <p>📅 報告期間：民國 {selectedYear} 年 Q{selectedQuarter}</p>
                                <p>📁 上傳檔案：{uploadedFiles.length} 個檔案</p>
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

                    {/* ✅ 檢視歷史檔案區域 */}
                    <div className="card bg-base-100 shadow-xl p-6 mx-auto w-4/5 max-w-screen-lg mb-6">
                        <p className="font-semibold mb-2">檢視檔案</p>
                        {uploadedFiles.length === 0 ? (
                            <p className="text-sm text-gray-500">尚無已上傳的報告</p>
                        ) : (
                            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                {uploadedFiles.map((file, idx) => (
                                    <li key={idx}>
                                        <a href={`/uploads/${file}`} target="_blank" rel="noopener noreferrer">
                                            {file.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}