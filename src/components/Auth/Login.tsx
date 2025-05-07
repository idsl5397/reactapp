'use client';

import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import Breadcrumbs from "@/components/Breadcrumbs";
import {userService} from "@/services/userServices";
import {Turnstile} from "@marsidev/react-turnstile";
import {getAccessToken, storeAuthTokens} from "@/services/serverAuthService";
import {UserData} from "@/types/UserType";
import {useauthStore} from "@/Stores/authStore";
import { useRouter } from 'next/navigation'
import { useMenuStore } from "@/Stores/menuStore";
import {startSilentRefresh} from "@/utils/SilentRefresh";

const api = axios.create({
    baseURL: "/proxy",
});

export default function Login() {

    const [usermail, setusermail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState<boolean>(false); // 控制驗證狀態
    const turnstile = useRef<any>(null);
    const {setIsLoggedIn} = useauthStore()
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "登入" }
    ];
    const router = useRouter()
    const { checkIsLoggedIn,isLoggedIn } = useauthStore();


    //先檢查登入狀態
    useEffect(() => {
        const checkLoginStatus = async () => {
            await checkIsLoggedIn();
            if (isLoggedIn) {
                router.push("/home");
            }
        };

        checkLoginStatus();
    }, [isLoggedIn, checkIsLoggedIn, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // 阻止表單預設提交行為
        setErrorMessage('');

        // 檢查 Turnstile 驗證是否完成
        if (!captchaToken) {
            setErrorMessage("請先完成驗證");
            return;
        }

        try {
            setIsVerifying(true); // 設置驗證進行中，避免重複請求

            // 驗證 Turnstile Captcha
            const captchaResponse = await axios.post(
                "/api/verify",
                { token: captchaToken },
                { headers: { "Content-Type": "application/json" } }
            );

            if (!captchaResponse.data.success) {
                setErrorMessage("驗證失敗，請重新嘗試");
                setIsVerifying(false);
                return;
            }

            // 登入請求
            const response = await userService.Login(usermail, password);

            if (response.success && response.nickname && response.email && response.token) {
                // 儲存使用者資料
                setUserData({
                    nickname: response.nickname,
                    email: response.email,
                    token: response.token
                });

                // 儲存登入 Token
                await storeAuthTokens(response.token);
                const token = await getAccessToken();
                console.log(token);
                setErrorMessage("");

                //怪怪的
                // // ✅ ⬇️ 這裡加上 SilentRefresh 啟動
                // if (token?.value) {
                //     startSilentRefresh(token.value);
                // }

                // 🔥 嘗試獲取選單資料
                try {
                    const res = await api.get('/Menu/GetMenus', {
                        headers: {
                            Authorization: token ? `Bearer ${token.value}` : '',
                        },
                    });
                    useMenuStore.getState().setMenu(res.data); // ✅ 寫入全域 store
                } catch (menuError) {
                    console.warn("選單取得失敗，預設為空");
                    useMenuStore.getState().setMenu([]); // ⛑️ fallback 空值，避免 Header 崩潰
                }

                setIsLoggedIn(true);
                router.push("/home");
            } else {
                setErrorMessage(response.message || "登入失敗，請稍後再試");
            }

        } catch (error) {
            // 處理 Axios 例外
            if (axios.isAxiosError(error) && error.response) {
                setErrorMessage(error.response.data?.message || '登入失敗');
            } else {
                console.error("非預期錯誤:", error);
                setErrorMessage('網路錯誤，請稍後再試');
            }
        } finally {
            setIsVerifying(false); // 解除鎖定狀態
            turnstile.current?.reset(); // 重設 CAPTCHA
        }
    };
    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
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
                                        <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
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
                                <Turnstile
                                    options={{
                                        language: "zh-tw",
                                    }}
                                    ref={turnstile}
                                    siteKey="0x4AAAAAABBGGF7DGYjKI4Qo"
                                    onSuccess={(token) => setCaptchaToken(token)} // 取得驗證 Token
                                    onError={() => setErrorMessage("驗證失敗，請重試")}
                                    onExpire={() => setCaptchaToken(null)} // 驗證過期時清除 Token
                                />
                            </div>
                            <div className="grid gap-x-8">
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="flex btn btn-primary w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm "
                                >
                                    {isVerifying ? "驗證中..." : "登入"}
                                </button>
                            </div>
                        </form>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                還沒有帳號嗎？{" "}
                                <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    前往註冊
                                </a>
                            </p>
                        </div>
                        {errorMessage && <p role="alert" style={{color: 'red'}}>{errorMessage}</p>}
                    </div>
                </div>
            </div>
        </>
    );
};
