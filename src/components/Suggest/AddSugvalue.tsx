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
    organizationId: number;
    organizationName: string;
    year: number;
    quarter: string;
    reports: KpiReportInput[];
}
export interface KpiReportInput {
    kpiDataId: number;
    value: number | null;
    isSkipped: boolean;
    remark: string;
}

//步驟介面 ex: 步驟一 SelectCompany?: SelectCompany;
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

export default function AddKPIvalue() {
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告" , href: "/reportEntry" },
        { label: "新增委員建議報告"}
    ];

    // 處理表單完成
    const handleFormComplete = async (data: FormDataType): Promise<void> => {

    };

    const handleSaveDraft = async (checkdata: Checkdata) => {

    };


    return (
        <>
            <Toaster position="top-right" reverseOrder={false}/>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold text-center mb-8 text-base-content">上傳委員建議報告步驟</h1>

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
                                        return true;
                                    }}
                                />
                            </StepCard>
                        </StepContent>

                        {/* 步驟 2: 填寫資料 */}
                        <StepContent step={1}>
                            <StepCard title="填寫資料">
                                <Step2 onSaveDraft={handleSaveDraft} />
                                <StepNavigationWrapper
                                    prevLabel="返回"
                                    nextLabel="確認並繼續"
                                    onSubmit={(stepData, updateStepData) => {
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
