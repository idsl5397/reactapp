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
import Step1 from '@/components/register/Step1';
import Step2,{ getLatestSelectedOrganization } from '@/components/register/Step2';
import Step3 from '@/components/register/Step3';
import Step4 from '@/components/register/Step4';

import axios from "axios";
import Breadcrumbs from "@/components/Breadcrumbs";

//步驟一 驗證email
export interface EmailVerificationFormData {
    userName: string;
    email: string;
    VerificationCode: string;
}

// 第二步驟
export interface UserInfo {
    organizationId: number;
    organizationName: string;
    typeId: number;
    typeName: string;
}

// 第三步驟
export interface BaseUserInfo{
    name: string;
    phone: string;
    password: string;
    confirmPassword: string;
    unit: string;
    position: string;
}

//步驟介面 ex: 步驟一 EmailVerificationForm?: EmailVerificationFormData;
interface ExtendedFormData extends FormDataType {
    EmailVerificationForm?: EmailVerificationFormData;
    userInfo?: UserInfo;
    userbaseinfo?: BaseUserInfo;
    verificationError?: string;
    userInfoError?: string;
    baseUserInfoError?: string;
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

export default function Register() {

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "註冊" }
    ];

    // 處理表單完成
    const handleFormComplete = async (data: FormDataType): Promise<void> => {
        console.log('表單提交成功', data);
        // 這裡可以加入實際的API調用
        const emailData = data.EmailVerificationForm as EmailVerificationFormData;
        const baseInfo = data.BaseUserInfo as BaseUserInfo;
        const userInfo = data.UserInfo as UserInfo;
        try {
            const response = await api.post('/Register/insert-user',
                {
                    UserName:emailData.userName,
                    phone:baseInfo.phone,
                    email:emailData.email,
                    name: baseInfo.name,
                    password:baseInfo.password,
                    organizationId:userInfo.organizationId,
                    unit:baseInfo.unit,
                    position:baseInfo.position,
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                });

            if (response.status < 200 || response.status >= 300) {
                throw new Error("送出失敗");
            }

            alert("註冊成功！");
            window.location.href = "/login";
        } catch (err) {
            alert((err as Error).message);
        }
    };


    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="mt-10 mb-8 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">註冊步驟</h1>

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
                                        const formData = (stepData.EmailVerificationForm as EmailVerificationFormData)?.email;
                                        console.log("輸入的 email 是：", formData);
                                        if (!formData) {
                                            updateStepData({ verificationError: "請輸入電子郵件和驗證碼" });

                                            return false;
                                        }
                                        try {
                                            // 假設有一個 API 可以驗證 email
                                            const response = await api.post(
                                                "/Register/verify-email",
                                                { email: formData },
                                            );

                                            if (response.status !== 200) {
                                                throw new Error("Email 驗證失敗");
                                            }

                                            const orgTree = response.data;
                                            const username = formData.split("@")[0];
                                            console.log("orgTree:",orgTree);
                                            // ✅ 把 id 存進 stepData（你可以用任何 key 命名）
                                            updateStepData({
                                                EmailVerificationForm: { email: formData,userName: username},
                                                organizationId: orgTree.data.id,
                                                organizationTree: orgTree,
                                            });
                                            console.log(orgTree.data.id);
                                            updateStepData({ verificationError: null });
                                            return true; // 驗證成功，進入下一步
                                        } catch (error: any) {
                                            const message = error?.response?.data?.message || "發生錯誤，請稍後再試";

                                            updateStepData({ verificationError: message }); // ✅ 顯示後端錯誤訊息

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
                                        const latest = getLatestSelectedOrganization();
                                        if (!latest?.data?.id) {
                                            updateStepData({ userInfoError: "請選擇一個組織層級" });
                                            return false;
                                        }

                                        updateStepData({
                                            UserInfo: {
                                                organizationId: latest.data.id,
                                                organizationName: latest.data.name,
                                                typeId: latest.data.typeId,
                                                typeName: latest.data.typeName,
                                            }
                                        });
                                        console.log(latest.data.id);
                                        console.log(latest.data.name);
                                        console.log(latest.data.typeId);
                                        console.log(latest.data.typeName);
                                        updateStepData({ userInfoError: null });
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
                                        const baseInfo = (stepData.BaseUserInfo as BaseUserInfo)
                                        console.log(baseInfo);

                                        if (!baseInfo) {
                                            updateStepData({ baseUserInfoError: "請填寫所有欄位" });
                                            return false;
                                        }
                                        const { name, phone, unit, position, password, confirmPassword } = baseInfo;

                                        // 驗證空值
                                        if (!name || !phone || !unit || !position || !password) {
                                            updateStepData({ baseUserInfoError: "請填寫所有欄位" });
                                            return false;
                                        }

                                        // 手機格式（簡易版：只能是數字且至少 8 碼）
                                        const phoneRegex = /^[0-9]{8,}$/;
                                        if (!phoneRegex.test(phone)) {
                                            updateStepData({ baseUserInfoError: "手機號碼格式錯誤" });
                                            return false;
                                        }

                                        // 密碼複雜度驗證（至少12碼，含大小寫、數字、符號）
                                        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_])[A-Za-z\d!@#$%^&*(),.?":{}|<>_]{12,}$/;
                                        if (!passwordRegex.test(password)) {
                                            updateStepData({
                                                baseUserInfoError: "密碼需至少12碼，並包含大小寫字母、數字與特殊符號",
                                            });
                                            return false;
                                        }

                                        // 密碼確認一致
                                        if (password !== confirmPassword) {
                                            updateStepData({ baseUserInfoError: "兩次密碼輸入不一致" });
                                            return false;
                                        }

                                        // 清除錯誤
                                        updateStepData({ baseUserInfoError: null });
                                        return true;
                                    }}
                                />
                            </StepCard>
                        </StepContent>
                        <StepContent step={3}>
                            <StepCard title="確認註冊">
                                <Step4/>
                                <StepNavigationWrapper
                                    prevLabel="返回"
                                    nextLabel="完成註冊並回到登入"
                                    onSubmit={() => {
                                        const confirmed = window.confirm("確定要完成註冊並提交資料嗎？");
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
