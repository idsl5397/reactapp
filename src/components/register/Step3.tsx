import React from "react";
import { useStepContext } from "../StepComponse";
import {BaseUserInfo} from "@/components/Auth/Register";


export default function Step3() {
    const { stepData, updateStepData } = useStepContext();

    const handleonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //值
        const { name, value } = e.target;

        const currentFormValues = (stepData.BaseUserInfo as BaseUserInfo) || {};

        updateStepData({
            BaseUserInfo: {
                ...currentFormValues,
                [name]: value
            },
        });
    }
    return (
        <div className="card-body p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">姓名</label>
                    <input
                        name="name"
                        type="text"
                        value={((stepData.BaseUserInfo as BaseUserInfo)?.name) || ''}
                        onChange={handleonChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="您的姓名"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">手機號碼</label>
                    <input
                        name="phone"
                        type="tel"
                        value={((stepData.BaseUserInfo as BaseUserInfo)?.phone) || ''}
                        onChange={handleonChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="您的手機號碼"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">部門</label>
                    <input
                        name="unit"
                        type="text"
                        value={((stepData.BaseUserInfo as BaseUserInfo)?.unit) || ''}
                        onChange={handleonChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="您的部門"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">職稱</label>
                    <input
                        name="position"
                        type="text"
                        value={((stepData.BaseUserInfo as BaseUserInfo)?.position) || ''}
                        onChange={handleonChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="您的職稱"
                    />
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">密碼</label>
                <input
                    name="password"
                    type="password"
                    value={((stepData.BaseUserInfo as BaseUserInfo)?.password) || ''}
                    onChange={handleonChange}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="設定密碼"
                />
            </div>
            <div className="text-sm text-gray-600 mb-4">
                密碼原則: 至少12個字元，並包含大小寫字母、數字與特殊符號。
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">確認密碼</label>
                <input
                    name="confirmPassword"
                    type="password"
                    value={((stepData.BaseUserInfo as BaseUserInfo)?.confirmPassword) || ''}
                    onChange={handleonChange}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="再次輸入密碼"
                />
            </div>
            {(stepData as any).baseUserInfoError && (
                <div className="text-red-500 text-sm mt-2">
                    {(stepData as any).baseUserInfoError}
                </div>
            )}
        </div>

    );
}