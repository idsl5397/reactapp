import React from "react";
import { useStepContext, FormDataType } from "./StepComponse";


interface Step1Props {
    email: string;
    setEmail: (email: string) => void;
}

interface ExtendedFormData extends FormDataType {
    Step1Props?: Step1Props;
}

export default function Step1() {
    const { stepData } = useStepContext();
    const step1Props = (stepData.step1Props as Step1Props) || {};

    return (
        <div className="card-body p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">姓名</label>
                    <input
                        name="name"
                        type="text"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="您的姓名"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">手機號碼</label>
                    <input
                        name="phone"
                        type="tel"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="您的手機號碼"
                    />
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">密碼</label>
                <input
                    name="password"
                    type="password"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="設定密碼"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">確認密碼</label>
                <input
                    name="confirmPassword"
                    type="password"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="再次輸入密碼"
                />
            </div>
        </div>

    );
}