"use client"
import React, { useState } from 'react';
import {
    FormDataType,
    MultiStepForm,
    StepAnimation,
    StepCard,
    StepContent,
    StepIndicatorComponent, StepNavigationWrapper
} from '@/components/register/StepComponse';
import Step1 from '@/components/register/Step1';
import Step2 from '@/components/register/Step2';
import Step3 from '@/components/register/Step3';
import axios from "axios";

// 定义共享的接口
interface UserData {
    Company: string[];
    Role: string[];

}
interface BaseUserInfo{
    name: string;
    phone: string;
    email: string;
    password: string;

}

//步驟介面 ex: 步驟一 EmailVerificationForm?: EmailVerificationFormData;
interface ExtendedFormData extends FormDataType {
    EmailVerificationForm?: EmailVerificationFormData;
    userData?: UserData;
    userbaseinfo?: BaseUserInfo;
}

//步驟一 驗證email
export interface EmailVerificationFormData {
    email: string;
    VerificationCode: string;
}

// 步驟定義
const steps = [
    { title: '確認信箱' },
    { title: '填寫層級' },
    { title: '個人資料' },
    { title: "確認註冊"},

];

const api = axios.create({
    baseURL: '/proxy',
});

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id: auditId } = React.use(params);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<undefined|string>(undefined);

    // 處理表單完成
    const handleFormComplete = async (data: FormDataType): Promise<void> => {
        console.log('表單提交成功', data);
        // 這裡可以加入實際的API調用
    };


    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-8 text-base-content">註冊步驟</h1>

            <MultiStepForm
                initialData={{} as ExtendedFormData}
                onComplete={handleFormComplete}
                totalStepsCount={4}
            >
                {/* 步驟指示器 */}
                <StepIndicatorComponent steps={steps} />

                {/* 步驟內容 */}
                <StepAnimation>
                    {/* 步驟 1: 身分驗證 */}
                    <StepContent step={0}>
                        <StepCard title="確認信箱">
                            <Step1/>
                            <StepNavigationWrapper
                                prevLabel="返回"
                                nextLabel="確認並繼續"
                                onSubmit={async (stepData, updateStepData) => {
                                    const formData = stepData.EmailVerificationForm as EmailVerificationFormData
                                    if (!formData.email) {
                                        updateStepData({ verificationError: "請輸入電子郵件和驗證碼" });
                                        return false;
                                    }
                                    try {
                                        // 假設有一個 API 可以驗證 email
                                        const response = await api.post("/verify-email", {
                                            email: formData.email,
                                        });

                                        if (response.status !== 200) {
                                            throw new Error("Email 驗證失敗");
                                        }

                                        return true; // 驗證成功，進入下一步
                                    } catch (error) {
                                        setErrorMessage("發生錯誤，請稍後再試");
                                        return false;
                                    }
                                }}
                            />
                        </StepCard>
                    </StepContent>

                    {/* 步驟 2: 身分確認 */}
                    <StepContent step={1}>
                        <StepCard title="填寫層級">
                            <Step2/>
                            <StepNavigationWrapper
                                prevLabel="返回"
                                nextLabel="確認並繼續"
                                onSubmit={(stepData, updateStepData) => {
                                    // 返回 true 表示可以進入下一步
                                    return true;
                                }}
                            />
                        </StepCard>
                    </StepContent>
                    <StepContent step={2}>
                        <StepCard title="個人資料">
                            <Step3/>
                            <StepNavigationWrapper
                                prevLabel="返回"
                                nextLabel="確認並繼續"
                                onSubmit={(stepData, updateStepData) => {
                                    // 返回 true 表示可以進入下一步
                                    return true;
                                }}
                            />
                        </StepCard>
                    </StepContent>
                    {/*<StepContent step={3}>*/}
                    {/*    <StepCard title="確認註冊">*/}

                    {/*    </StepCard>*/}
                    {/*</StepContent>*/}
                </StepAnimation>
            </MultiStepForm>
        </div>
    );
}
