'use client';

import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import Breadcrumbs from "@/components/Breadcrumbs";
import {userService} from "@/services/userServices";
import {getAccessToken, storeAuthTokens} from "@/services/serverAuthService";
import {UserData} from "@/types/UserType";
import {useauthStore} from "@/Stores/authStore";
import { useRouter } from 'next/navigation'
import { useMenuStore } from "@/Stores/menuStore";
import {toast, Toaster} from "react-hot-toast";
import api from "@/services/apiService"
import ForgotPasswordModal from './ForgotPasswordModal';
const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";


export default function Login() {
    const [usermail, setusermail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true); // 新增：追蹤驗證狀態
    const turnstile = useRef<any>(null);
    const { setIsLoggedIn, checkIsLoggedIn, isLoggedIn, checkAuthStatus } = useauthStore();
    const [showForgotModal, setShowForgotModal] = useState(false);

    const breadcrumbItems = [
        { label: "首頁", href: `${NPbasePath}/home` },
        { label: "登入" }
    ];
    const router = useRouter();

    // 修正 1: 正確設定依賴項，避免無限迴圈
    useEffect(() => {
        let isCancelled = false; // 防止競態條件

        const checkLoginStatus = async () => {
            try {
                setIsCheckingAuth(true);
                await checkIsLoggedIn();

                // 只有在元件還未卸載時才執行後續操作
                if (!isCancelled) {
                    const currentLoginState = useauthStore.getState().isLoggedIn;
                    if (currentLoginState) {
                        router.push("/home");
                    }
                }
            } catch (error) {
                console.error("檢查登入狀態失敗:", error);
            } finally {
                if (!isCancelled) {
                    setIsCheckingAuth(false);
                }
            }
        };

        checkLoginStatus();

        // 清理函數
        return () => {
            isCancelled = true;
        };
    }, []); // 修正：移除 isLoggedIn 和其他可能變化的依賴項

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');

        // 暫時略過驗證
        // if (!captchaToken) {
        //     setErrorMessage("請先完成驗證");
        //     return;
        // }

        try {
            setIsVerifying(true);

            // 暫時跳過 captcha 檢查
            // const captchaResponse = await axios.post(
            //     "/api/verify",
            //     { token: captchaToken },
            //     { headers: { "Content-Type": "application/json" } }
            // );
            //
            // if (!captchaResponse.data.success) {
            //     setErrorMessage("驗證失敗，請重新嘗試");
            //     setIsVerifying(false);
            //     return;
            // }

            const response = await userService.Login(usermail, password);

            if (response.success && response.nickname && response.email && response.token && response.refreshToken) {
                if (response.message?.includes("密碼將於")) {
                    toast.custom((t) => (
                        <div className="bg-white shadow-md rounded px-4 py-3 text-gray-800 max-w-md w-full">
                            <div className="flex justify-between items-start">
                                <div className="text-sm">{response.message}</div>
                                <button
                                    type="button"
                                    onClick={() => toast.dismiss(t.id)}
                                    className="ml-4 text-indigo-600 underline text-sm"
                                >
                                    知道了
                                </button>
                            </div>
                        </div>
                    ), {
                        duration: Infinity,
                        position: "top-center"
                    });
                }
                if (response.warningMessage) {
                    localStorage.setItem("login-warning", response.warningMessage);
                    console.log("warningMessage:", response.warningMessage);
                }

                setUserData({
                    nickname: response.nickname,
                    email: response.email,
                    token: response.token
                });
                await storeAuthTokens(response.token,response.refreshToken);
                const token = await getAccessToken();
                console.log('Access Token', token?.value);

                // 修正 2: 優化狀態更新順序，避免重複呼叫
                await checkAuthStatus(); // 先更新認證狀態
                setIsLoggedIn(true); // 再設定登入狀態
                setErrorMessage("");



                // 修正 3: 延遲導航，確保狀態已更新
                setTimeout(() => {
                    router.push("/home");
                }, 100);

            } else {

                setErrorMessage(response.message || "登入失敗，請稍後再試");
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setErrorMessage(error.response.data?.message || '登入失敗');
            } else {
                console.error("非預期錯誤:", error);
                setErrorMessage('網路錯誤，請稍後再試');
            }
        } finally {
            setIsVerifying(false);
            // 暫時跳過 captcha 檢查
            // turnstile.current?.reset();
        }
    };

    // 如果還在檢查認證狀態，顯示載入畫面
    if (isCheckingAuth) {
        return (
            <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-500">檢查登入狀態中...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" reverseOrder={false}/>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        登入
                    </h1>
                </div>
                <div className="card bg-base-100 shadow-xl w-full sm:w-96 p-6 mr-4">
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={handleSubmit}>
                            <h2 id="login-form-title" className="sr-only">
                                登入表單
                            </h2>
                            <div>
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                    輸入信箱
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={usermail}
                                        onChange={(e) => setusermail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div className="pb-12">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                        輸入密碼
                                    </label>
                                    <div className="text-sm">
                                        <a
                                            href="#"
                                            onClick={() => setShowForgotModal(true)}
                                            className="font-semibold text-indigo-600 hover:text-indigo-500"
                                        >
                                            忘記密碼?
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-center">
                                {/* 暫時移除 Turnstile */}
                                {/* <Turnstile
                                    options={{ language: "zh-tw" }}
                                    ref={turnstile}
                                    siteKey="0x4AAAAAABBGGF7DGYjKI4Qo"
                                    onSuccess={(token) => setCaptchaToken(token)}
                                    onError={() => setErrorMessage("驗證失敗，請重試")}
                                    onExpire={() => setCaptchaToken(null)}
                                /> */}
                            </div>
                            <div className="grid gap-x-8">
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    aria-label="登入"
                                    className="flex btn btn-primary w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm "
                                >
                                    {isVerifying ? "驗證中..." : "登入"}
                                </button>
                            </div>
                        </form>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                還沒有帳號嗎？{' '}
                                <a className="font-semibold text-indigo-600 hover:text-indigo-500"
                                   href={`${NPbasePath}/register`}>
                                    前往註冊
                                </a>
                            </p>
                        </div>
                        {errorMessage && <p role="alert" style={{color: 'red'}}>{errorMessage}</p>}
                    </div>
                </div>
            </div>
            {/* 彈出視窗 */}
            <ForgotPasswordModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
            />
        </>
    );
};
