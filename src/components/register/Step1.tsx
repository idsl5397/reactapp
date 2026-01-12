import React, {forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import { useStepContext} from "../StepComponse";
import {EmailVerificationFormData} from "@/components/Auth/Register";


export type Step1Ref = {
    focusEmail: () => void;
    getEmailInput: () => HTMLInputElement | null;
};

const Step1 = forwardRef<Step1Ref>((_props, ref) => {
    const { stepData, updateStepData } = useStepContext();
    const emailInputRef = useRef<HTMLInputElement>(null);
    const verificationError = (stepData as any).verificationError as string | null;
    useImperativeHandle(ref, () => ({
        focusEmail: () => {
            emailInputRef.current?.focus();
            emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        getEmailInput: () => emailInputRef.current
    }));

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const currentFormValues = (stepData.EmailVerificationForm as EmailVerificationFormData) || {};
        updateStepData({
            EmailVerificationForm: {
                ...currentFormValues,
                [name]: value
            },
            verificationError: null, // 清錯
        });
    };

    // 🔴 一偵測到 verificationError，就把焦點與泡泡交回 input
    useEffect(() => {
        const el = emailInputRef.current;
        if (!el) return;

        if (verificationError) {
            el.setCustomValidity(verificationError);
            // 等到 DOM paint 之後再做，避免被重新渲染打斷
            requestAnimationFrame(() => {
                el.reportValidity();                 // 顯示原生泡泡
                el.focus();                          // 把焦點放回輸入框
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        } else {
            el.setCustomValidity("");
        }
    }, [verificationError]);

    return (
        <div className="card w-full bg-white shadow-md rounded-lg">
            <div className="card-header p-4 border-b font-medium text-lg text-gray-800">請輸入電子信箱</div>
            <div className="card-body p-6">
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-800">電子郵件</label>
                    <input
                        ref={emailInputRef}
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={(stepData.EmailVerificationForm as EmailVerificationFormData)?.email || ""}
                        onChange={handleOnChange}
                        className="w-full p-3 border rounded-md focus:outline-nonetext-gray-800"
                        placeholder="Email"
                        aria-invalid={!!(stepData as any).verificationError}
                        aria-describedby={(stepData as any).verificationError ? "email-error" : undefined}
                    />
                    {(stepData as any).verificationError && (
                        <div id="email-error" role="alert" aria-live="assertive" className="text-red-500 text-sm mt-2">
                            {(stepData as any).verificationError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
Step1.displayName = "Step1";
export default Step1;