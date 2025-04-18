import React from "react";
import { useStepContext} from "./StepComponse";
import {EmailVerificationFormData} from "@/components/Auth/Register";




export default function Step1() {
    const { stepData, updateStepData } = useStepContext();

    const handleonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //值

        const { name, value } = e.target;

        const currentFormValues = (stepData.EmailVerificationForm as EmailVerificationFormData) || {};

        updateStepData({
            EmailVerificationForm: {
                ...currentFormValues,
                [name]: value
            },
        });
    }

    return (
        <div className="card w-full bg-white shadow-md rounded-lg">
            <div className="card-header p-4 border-b font-medium text-lg">請輸入電子信箱</div>
            <div className="card-body p-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">電子郵件</label>
                    <input
                        name="email"
                        type="email"
                        value={((stepData.EmailVerificationForm as EmailVerificationFormData)?.email) || ''}
                        onChange={handleonChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email"
                    />
                    {(stepData as any).verificationError && (
                        <div className="text-red-500 text-sm mt-2">
                            {(stepData as any).verificationError}
                        </div>
                    )}
                </div>

                {/*<div className="text-sm text-gray-600 mb-4">*/}
                {/*    我們將向此郵箱發送驗證碼，請確保能夠接收郵件。*/}
                {/*</div>*/}
            </div>
        </div>

    );
}