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
import Step1 from '@/components/ReportKPI/AddKpiValueStep1';
import Step2 from '@/components/ReportKPI/AddKpiValueStep2';
import type { Kpi } from "@/components/ReportKPI/AddKpiValueStep2";
import Step3 from '@/components/ReportKPI/AddKpiValueStep3';
import axios from "axios";
import Breadcrumbs from "@/components/Breadcrumbs";
import {toast, Toaster} from "react-hot-toast";

//步驟一 選擇公司/工廠
export interface SelectCompany {
    organizationId: number;
    organizationName: string;
    year: number;
    quarter: string;
}

// 第二步驟
export interface KpiDataInput {
    kpiList?: any[];
}

// 第三步驟
export interface Checkdata{
    organizationName: string;
    year: number;
    quarter: string;
    reports: KpiReportInput[];
}
export interface KpiReportInput {
    kpiDataId: number;
    value: number | null;
    isSkipped: boolean;
}

//步驟介面 ex: 步驟一 EmailVerificationForm?: EmailVerificationFormData;
interface ExtendedFormData extends FormDataType {
    SelectCompany?: SelectCompany;
    KpiDataInput?: KpiDataInput;
    Checkdata?: Checkdata;
}


// 步驟定義
const steps = [
    { title: '選擇公司/工廠' },
    { title: '填寫報告' },
    { title: '確認送出' },

];

const api = axios.create({
    baseURL: '/proxy',
});

export default function Register() {

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告" , href: "/reportEntry" },
        { label: "新增績效指標報告"}
    ];

    // 處理表單完成
    const handleFormComplete = async (data: FormDataType): Promise<void> => {
        console.log('表單提交成功', data);
        const selectCompany = data.SelectCompany as SelectCompany;
        const checkdata = data.Checkdata as Checkdata;

        const payload = checkdata.reports.map((report) => ({
            year: selectCompany.year,
            quarter: selectCompany.quarter,
            kpiDataId: report.kpiDataId,
            value: report.isSkipped ? null : report.value,
            isSkipped: report.isSkipped,
        }));

        console.log("送出資料：", payload);
        try {
            const response = await api.post("/Kpi/submit-kpi-report", payload);
            const res = response.data;

            if (res.success) {
                toast.success("報告送出成功！");
            } else {
                if (res.message.includes("重複")) {
                    toast.error("送出失敗：資料重複，請勿重複提交！");
                } else {
                    toast.error(`送出失敗：${res.message}`);
                }
            }
        } catch (error: any) {
            console.error("提交錯誤", error);
            toast.error("提交失敗，請稍後再試");
        }
    };


    return (
        <>
            <Toaster position="top-right" reverseOrder={false}/>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold text-center mb-8 text-base-content">上傳績效指標報告步驟</h1>

                <MultiStepForm
                    initialData={{} as ExtendedFormData}
                    onComplete={handleFormComplete}
                    totalStepsCount={3}
                >
                    {/* 步驟指示器 */}
                    <StepIndicatorComponent steps={steps} />

                    {/* 步驟內容 */}
                    <StepAnimation>
                        {/* 步驟 1: 選擇公司/工廠 */}
                        <StepContent step={0}>
                            <StepCard title="選擇公司/工廠">
                                <Step1/>
                                <StepNavigationWrapper
                                    prevLabel="返回"
                                    nextLabel="確認並繼續"
                                    onSubmit={async (stepData, updateStepData) => {
                                        const orgId = (stepData.SelectCompany as SelectCompany)?.organizationId;
                                        const year = (stepData.SelectCompany as SelectCompany)?.year;
                                        const quarter = (stepData.SelectCompany as SelectCompany)?.quarter;

                                        if (!orgId) {
                                            toast.error("請先選擇公司或工廠！");
                                            return false;
                                        }

                                        if (!year || !quarter) {
                                            toast.error("請選擇完整的年度與季度！");
                                            return false;
                                        }

                                        try {
                                            const response = await api.get("/Kpi/kpidata-for-report", {
                                                params: { organizationId: orgId },
                                            });
                                            const res = response.data;
                                            if (!res.success) {
                                                toast.error(res.message || "查詢失敗");
                                                return false;
                                            }
                                            const kpiDataList = res.data;
                                            if (!Array.isArray(kpiDataList) || kpiDataList.length === 0) {
                                                toast.error("該公司尚無 KPI 資料可填報");
                                                return false;
                                            }
                                            toast.success(`抓到 ${kpiDataList.length} 筆 KPI 指標，可建立報告`);
                                            console.log("抓到的 KPI 資料：", kpiDataList);
                                            // ✅ 將資料暫存在 stepData 供 Step2 使用
                                            updateStepData({
                                                kpiDataInput: {
                                                    kpiList: kpiDataList
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

                        {/* 步驟 2: 填寫資料 */}
                        <StepContent step={1}>
                            <StepCard title="填寫資料">
                                <Step2/>
                                <StepNavigationWrapper
                                    prevLabel="返回"
                                    nextLabel="確認並繼續"
                                    onSubmit={(stepData, updateStepData) => {
                                        const reportMap = stepData.kpiReportInput as Record<string, string>;
                                        const kpiList = (stepData.kpiDataInput as { kpiList?: Kpi[] })?.kpiList || [];

                                        // 找出沒有填寫且沒勾選跳過的
                                        const missing = kpiList.find((kpi) => {
                                            const isSkipped = reportMap[`skip_${kpi.kpiDataId}`];
                                            const value = reportMap[kpi.kpiDataId];
                                            return !isSkipped && (value === undefined || value === "");
                                        });

                                        if (missing) {
                                            toast.error(`請填寫所有 KPI 執行情況（缺少：「${missing.indicatorName} - ${missing.detailItemName}」）`);

                                            // 🔁 focus 到對應輸入框
                                            if ((stepData as any)._focusMissingInput) {
                                                (stepData as any)._focusMissingInput(missing.kpiDataId);
                                            }

                                            return false;
                                        }

                                        // ✅ 將每筆報告都送出，標記 isSkipped 與 value（若是跳過則為 null）
                                        const reports = kpiList.map((kpi) => {
                                            const isSkipped = Boolean(reportMap[`skip_${kpi.kpiDataId}`]);
                                            const value = isSkipped ? null : Number(reportMap[kpi.kpiDataId]);

                                            return {
                                                kpiDataId: kpi.kpiDataId,
                                                value,
                                                isSkipped,
                                            };
                                        });

                                        const company = stepData.SelectCompany as SelectCompany;

                                        updateStepData({
                                            Checkdata: {
                                                organizationId: company.organizationId,
                                                year: company.year,
                                                quarter: company.quarter,
                                                reports,
                                            },
                                        });

                                        return true;
                                    }}
                                />
                            </StepCard>
                        </StepContent>
                        <StepContent step={2}>
                            <StepCard title="確認資料">
                                <Step3/>
                                <StepNavigationWrapper
                                    prevLabel="返回"
                                    nextLabel="確認並送出"
                                    onSubmit={() => {
                                        const confirmed = window.confirm("確定提交資料嗎？");
                                        if (!confirmed) return false; // 使用者取消送出
                                        return true;
                                    }}
                                />
                            </StepCard>
                        </StepContent>
                    </StepAnimation>
                </MultiStepForm>
            </div>
        </>
    );
}
