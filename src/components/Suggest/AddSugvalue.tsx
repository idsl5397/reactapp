"use client"
import React, {useRef, useState} from 'react';
import {
    FormDataType,
    MultiStepForm,
    StepAnimation,
    StepCard,
    StepContent,
    StepIndicatorComponent, StepNavigationWrapper
} from '@/components/StepComponse';
import Step1, {AddSugStep1Ref} from '@/components/ReportSuggest/AddSugValueStep1';
import Step2 from '@/components/ReportSuggest/AddSugValueStep2';
import Breadcrumbs from "@/components/Breadcrumbs";
import {toast, Toaster} from "react-hot-toast";
import api from "@/services/apiService"
import {getAccessToken} from "@/services/serverAuthService";

//步驟一 選擇公司/工廠
export interface SelectCompany {
    organizationId: number;
    organizationName: string;
}

// 第二步驟
export interface suggestReportData {
    reportList?: any[];
}

//步驟介面 ex: 步驟一 SelectCompany?: SelectCompany;
interface ExtendedFormData extends FormDataType {
    SelectCompany?: SelectCompany;
    suggestReportData?: suggestReportData;
}

// 步驟定義
const steps = [
    { title: '選擇公司/工廠' },
    { title: '填寫報告' },
    { title: '完成' },
];

const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AddKPIvalue() {
    const breadcrumbItems = [
        { label: "首頁", href: `${NPbasePath}/home` },
        { label: "填報資料" , href: `${NPbasePath}/reportEntry` },
        { label: "上傳委員建議報告"}
    ];

    // 步驟三需要的資訊（送出後記錄）
    const [successData, setSuccessData] = useState<{
        organizationId: number;
        organizationName: string;
        count: number;
    } | null>(null);
    const [downloading, setDownloading] = useState(false);

    const handleFormComplete = async (data: FormDataType): Promise<void> => {};

    const step1Ref = useRef<AddSugStep1Ref>(null);

    const downloadPdf = async () => {
        if (!successData) return;
        setDownloading(true);
        try {
            const t = await getAccessToken();
            const response = await api.get("/Suggest/report-pdf", {
                params: { organizationId: successData.organizationId },
                responseType: "blob",
                headers: { Authorization: t ? `Bearer ${t.value}` : "" },
            });
            const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `${successData.organizationName}_委員建議報告.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("PDF 下載失敗，請稍後再試");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={false}/>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold text-center mb-8 text-base-content text-gray-900">上傳委員建議報告</h1>
            </div>

            <MultiStepForm
                initialData={{} as ExtendedFormData}
                onComplete={handleFormComplete}
                totalStepsCount={3}
            >
                {/* 步驟指示器 */}
                <StepIndicatorComponent steps={steps}/>

                {/* 步驟內容 */}
                <StepAnimation>
                    {/* 步驟 1: 選擇公司/工廠 */}
                    <div className="max-w-4xl mx-auto p-4">
                        <StepContent step={0}>
                            <StepCard title="選擇公司/工廠">
                                <Step1 ref={step1Ref} />
                                <StepNavigationWrapper
                                    prevLabel="返回"
                                    nextLabel="確認並繼續"
                                    onSubmit={async (stepData, updateStepData) => {
                                        if (!step1Ref.current?.validateAndFocus()) return false;
                                        const orgId = (stepData.SelectCompany as SelectCompany)?.organizationId;

                                        if (!orgId) {
                                            toast.error("請先選擇公司或工廠！");
                                            return false;
                                        }

                                        try {
                                            const response = await api.get("/Suggest/selectOrg-for-report", {
                                                params: {organizationId: orgId},
                                            });

                                            const res = response.data;

                                            if (!Array.isArray(res) || res.length === 0) {
                                                toast.error("該公司尚無委員建議資料");
                                                return false;
                                            }

                                            toast.success(`抓到 ${res.length} 筆委員建議資料`);

                                            const orgName: string =
                                                (res as any[])[0]?.OrgName ??
                                                (res as any[])[0]?.orgName ?? "";
                                            updateStepData({
                                                SelectCompany: {
                                                    ...(stepData.SelectCompany as SelectCompany),
                                                    organizationName: orgName,
                                                },
                                                suggestReportData: {
                                                    reportList: res
                                                }
                                            });

                                            return true;
                                        } catch (error: any) {
                                            toast.error(`API 發生錯誤：${error.message}`);
                                            return false;
                                        }
                                    }}
                                />
                            </StepCard>
                        </StepContent>
                    </div>

                    {/* 步驟 2: 填寫資料 */}
                    <StepContent step={1}>
                        <div className="px-0.5">
                            <StepCard title="填寫資料">
                                <Step2 />
                                <StepNavigationWrapper
                                    prevLabel="返回"
                                    nextLabel="確認送出"
                                    onSubmit={async (stepData, updateStepData) => {
                                        const updatedList = (stepData.suggestReportData as { reportList?: any[] })?.reportList || [];
                                        const selectCompany = stepData.SelectCompany as SelectCompany;

                                        if (!updatedList.length) {
                                            toast.error("無更新資料可送出");
                                            return false;
                                        }

                                        try {
                                            const res = await api.put("/Suggest/update-report", updatedList);
                                            if (res.data?.success === false) {
                                                toast.error(res.data.message || "更新失敗");
                                                return false;
                                            }

                                            // 記錄成功資訊供步驟三使用
                                            setSuccessData({
                                                organizationId: selectCompany?.organizationId,
                                                organizationName: selectCompany?.organizationName ?? "",
                                                count: updatedList.length,
                                            });

                                            toast.success("已成功更新委員建議執行狀況！");
                                            return true;
                                        } catch (error: any) {
                                            toast.error("儲存失敗：" + error.message);
                                            return false;
                                        }
                                    }}
                                />
                            </StepCard>
                        </div>
                    </StepContent>

                    {/* 步驟 3: 完成 */}
                    <div className="max-w-4xl mx-auto p-4">
                        <StepContent step={2}>
                            <StepCard title="完成">
                                <div className="flex flex-col items-center text-center space-y-5 py-6">
                                    <div className="text-6xl">✅</div>
                                    <h2 className="text-xl font-bold text-green-800">報告上傳成功</h2>
                                    {successData && (
                                        <p className="text-green-700">
                                            <strong>{successData.organizationName || "已選擇公司"}</strong> 的委員建議報告
                                            （共 {successData.count} 筆）已成功更新。
                                        </p>
                                    )}
                                    <div className="flex justify-center gap-3 pt-2">
                                        <button
                                            className="btn btn-primary"
                                            disabled={downloading}
                                            onClick={downloadPdf}
                                        >
                                            {downloading ? (
                                                <span className="loading loading-spinner loading-xs"/>
                                            ) : "📄 下載 PDF 報告"}
                                        </button>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => window.location.reload()}
                                        >
                                            重新填報
                                        </button>
                                    </div>
                                </div>
                            </StepCard>
                        </StepContent>
                    </div>
                </StepAnimation>
            </MultiStepForm>
        </>
    );
}
