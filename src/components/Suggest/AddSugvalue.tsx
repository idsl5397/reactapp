"use client"
import React from 'react';
import {
    FormDataType,
    MultiStepForm,
    StepAnimation,
    StepCard,
    StepContent,
    StepIndicatorComponent, StepNavigationWrapper
} from '@/components/StepComponse';
import Step1 from '@/components/ReportSuggest/AddSugValueStep1';
import Step2 from '@/components/ReportSuggest/AddSugValueStep2';
import axios from "axios";
import Breadcrumbs from "@/components/Breadcrumbs";
import {toast, Toaster} from "react-hot-toast";

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

];

const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const api = axios.create({
    baseURL: `${NPbasePath}/proxy`,
});

export default function AddKPIvalue() {
    const breadcrumbItems = [
        { label: "首頁", href: `${NPbasePath}/home` },
        { label: "填報資料" , href: `${NPbasePath}/reportEntry` },
        { label: "新增委員建議報告"}
    ];

    // 處理表單完成
    const handleFormComplete = async (data: FormDataType): Promise<void> => {

    };



    return (
        <>
            <Toaster position="top-right" reverseOrder={false}/>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold text-center mb-8 text-base-content">上傳委員建議報告步驟</h1>
            </div>

            <MultiStepForm
                initialData={{} as ExtendedFormData}
                onComplete={handleFormComplete}
                totalStepsCount={2}
            >
                {/* 步驟指示器 */}
                <StepIndicatorComponent steps={steps}/>

                {/* 步驟內容 */}
                <StepAnimation>
                    {/* 步驟 1: 選擇公司/工廠 */}
                    <div className="max-w-4xl mx-auto p-4">
                        <StepContent step={0}>
                            <StepCard title="選擇公司/工廠">
                                <Step1/>
                                <StepNavigationWrapper
                                    prevLabel="返回"
                                    nextLabel="確認並繼續"
                                    onSubmit={async (stepData, updateStepData) => {
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

                                            // 若後端直接傳 array，無 success / message 結構：
                                            if (!Array.isArray(res) || res.length === 0) {
                                                toast.error("該公司尚無委員建議資料");
                                                return false;
                                            }

                                            toast.success(`抓到 ${res.length} 筆委員建議資料`);
                                            console.log("抓到的委員建議資料：", res);

                                            // ✅ 將資料暫存在 stepData，供下一步使用
                                            updateStepData({
                                                suggestReportData: {
                                                    reportList: res
                                                }
                                            });

                                            return true; // ✅ 可以進入下一步
                                        } catch (error: any) {
                                            console.error("API Error:", error);
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
                                    nextLabel="確認資料"
                                    onSubmit={async (stepData, updateStepData) => {
                                        const updatedList = (stepData.suggestReportData as { reportList?: any[] })?.reportList || [];

                                        if (!updatedList.length) {
                                            toast.error("無更新資料可送出");
                                            return false;
                                        }

                                        try {
                                            const res = await api.put("/Suggest/update-report", updatedList); // ⬅️ 使用 PUT 更新
                                            if (res.data?.success === false) {
                                                toast.error(res.data.message || "更新失敗");
                                                return false;
                                            }

                                            toast.success("已成功更新委員建議執行狀況！");
                                            return true;
                                        } catch (error: any) {
                                            console.error("儲存錯誤：", error);
                                            toast.error("儲存失敗：" + error.message);
                                            return false;
                                        }
                                    }}
                                />
                            </StepCard>
                        </div>
                    </StepContent>
                </StepAnimation>
            </MultiStepForm>
        </>
    );
}
