'use client';
import React, {useState, useEffect, useMemo, useRef} from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectOnlyEnterprise";
import { getAccessToken } from "@/services/serverAuthService";
import {
    TrashIcon,
    DocumentArrowUpIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChevronDownIcon
} from "@heroicons/react/16/solid";
import {CloudArrowUpIcon, DocumentTextIcon, CalendarDaysIcon, BuildingOfficeIcon} from "@heroicons/react/24/outline";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';
import api from "@/services/apiService"
import {FileUpload, UploadResponse} from "@/components/File/FileUpload";
import {FileService} from "@/services/FileService";
const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";


interface getlist{
    year:string;
    quarter:string;
    filePath:string;
    oriName:string;
}
export default function Improvement(){
    const [orgId, setOrgId] = useState<string>("");
    const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [historicalFiles, setHistoricalFiles] = useState<getlist[]>([]);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [uploadKey, setUploadKey] = useState(0);

    const uploadedFilePathRef = useRef<string | null>(null);

    const fetchFiles = async (orgIdParam?: string) => {
        try {
            const token = await getAccessToken();
            const response = await api.get("/Improvement/list-files", {
                params: { orgId: orgIdParam || orgId },
                headers: token ? { Authorization: `Bearer ${token.value}` } : {},
            });
            setHistoricalFiles(response.data.files ?? []);
        } catch (error) {
            console.error("取得檔案失敗：", error);
            toast.error("取得歷史檔案失敗");
        }
    };

    const historicalFilesByPeriod = useMemo(() => {
        const grouped: { [key: string]: typeof historicalFiles } = {};

        historicalFiles.forEach((file) => {
            if (file.year && file.quarter) {
                const periodKey = `${file.year}_Q${file.quarter}`;
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
        { label: "首頁", href: `${NPbasePath}/home` },
        { label: "填報資料" , href: `${NPbasePath}/reportEntry` },
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



    const handleSubmit = async () => {
        if (!orgId) {
            toast.error("請先選擇公司/工廠");
            return;
        }

        if (uploadedFiles.length === 0 || !uploadedFiles[0]?.data?.filePath) {
            toast.error("請先上傳檔案");
            return;
        }
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("orgId", orgId);
            formData.append("year", selectedYear.toString());
            formData.append("quarter", selectedQuarter.toString());
            formData.append("filepath",uploadedFiles[0].data.filePath );


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
            setUploadedFiles([]);
            setFile(null);
            uploadedFilePathRef.current = null;
            setIsDragOver(false);
            // 讓 FileUpload 重新掛載
            setUploadKey(k => k + 1);

        } catch (error) {
            console.error("提交失敗：", error);
            toast.error("提交失敗，請稍後再試");
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = orgId && uploadedFiles.length > 0;


    const handleDownloadFile = async (filePath?: string, fileName?: string) => {
        // 提前验证参数
        if (!filePath || !fileName) {
            toast.error("無此檔案");
            return;
        }


        try {
            await FileService.DownloadFile(filePath, fileName);
            // 可选：显示成功消息
            // toast.success("下載成功");
        } catch (error) {
            console.error('下载失败:', error);
            toast.error("下載失敗，請稍後再試");
        } finally {

        }
    };

// 刪除（以 filePath 為準）
    const handleDeleteFile = async (filePath: string) => {
        try {
            const token = await getAccessToken();
            await api.delete('/Improvement/delete-file', {
                params: { filePath, orgId },
                headers: token ? { Authorization: `Bearer ${token.value}` } : {},
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
                                <span className="text-sm font-medium text-gray-900">選擇公司</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${uploadedFiles.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {uploadedFiles.length > 0 ? <CheckCircleIcon className="w-5 h-5" /> : '2'}
                                </div>
                                <span className="text-sm font-medium text-gray-900">上傳檔案</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${canSubmit ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                    3
                                </div>
                                <span className="text-sm font-medium text-gray-900">確認送出</span>
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
                                        <CalendarDaysIcon className="w-4 h-4 inline mr-1"/>
                                        民國年度
                                    </label>
                                    <div className="mt-2 grid grid-cols-1">
                                        <select
                                            id="year"
                                            name="year"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <ClockIcon className="w-4 h-4 inline mr-1"/>
                                        報告季度
                                    </label>
                                    <div className="mt-2 grid grid-cols-1">
                                        <select
                                            id="quarter"
                                            name="quarter"
                                            aria-label="選擇季度"
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
                                                {period === "其他" ? "其他檔案" : `民國 ${period.replace('_', ' 年 第 ')} 季`}
                                            </h3>
                                            <span className="text-sm text-gray-500">({files.length} 個檔案)</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {files.map((f, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <DocumentArrowUpIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                        <button
                                                            onClick={() => handleDownloadFile(f.filePath, f.oriName)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium truncate"
                                                            title={f.oriName}
                                                        >
                                                            {f.oriName}
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteFile(f.filePath)}
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
                                <label className="label">
                                    <span className="label-text">選擇檔案 (必填)</span>
                                </label>
                                <FileUpload
                                    key={uploadKey}
                                    endpoints={{
                                        singleFileUrl: '/Files/UploadFile',
                                        removeFileUrl: '/Files/DeleteItem',
                                    }}
                                    targetPath={"/Files/Reports/"}
                                    multiple={false}
                                    maxSize={100 * 1024 * 1024}
                                    maxFiles={1}

                                    acceptedFileTypes={[
                                        "application/pdf",
                                        "application/msword",
                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                        "application/vnd.ms-excel",
                                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        "application/vnd.ms-powerpoint",
                                        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                        "text/plain",
                                        "image/jpeg",
                                        "image/png",
                                        "image/gif"
                                    ]}
                                    uploadOptions={{
                                        overwrite: true,
                                        createDirectory: true,
                                        validateIntegrity: false,
                                        expectedHash: "0",
                                        scanForVirus: false,
                                        customFileName: "",
                                        description: "",
                                        startWatchingAfterUpload: false,
                                    }}
                                    labels={{
                                        dropzone: '拖曳檔案至此',
                                        browse: '或點擊上傳',
                                        maxFiles: '最多上傳',
                                        maxSize: '檔案大小上限',
                                        uploading: '上傳中...'
                                    }}
                                    onSuccess={(response: UploadResponse, _fileId: string) => {
                                        console.log('上傳成功:', response);
                                        // 儲存檔案路徑，以便取消時刪除
                                        if (response.data?.filePath) {
                                            uploadedFilePathRef.current = response.data.filePath;
                                        }

                                        // 創建一個虛擬檔案物件來滿足表單驗證
                                        if (response.data?.originalFileName) {
                                            const virtualFile = new File([''], response.data.originalFileName, {type: 'application/octet-stream'});
                                            setFile(virtualFile);
                                        }
                                        setUploadedFiles([response])

                                    }}
                                    onError={(error: Error, _fileId: string) => {
                                        console.error('上傳失敗:', error);
                                        toast.error(`上傳失敗: ${error.message}`);
                                    }}
                                />



                        </div>
                    </div>

                    {/* 確認送出 */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <ExclamationCircleIcon className="w-6 h-6 text-amber-600"/>
                            <h2 className="text-xl font-semibold text-gray-800">確認送出</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-medium text-gray-800 mb-4">提交資訊確認</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-3 h-3 rounded-full ${orgId ? 'bg-green-500' : 'bg-red-500'}`}></div>
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
                                        <div className={`w-3 h-3 rounded-full ${file?.name ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-gray-700">上傳檔案：</span>
                                        <span className={file?.name ? 'text-green-700 font-medium' : 'text-red-700'}>
                                            {file?.name? file?.name: '未選擇檔案'}
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