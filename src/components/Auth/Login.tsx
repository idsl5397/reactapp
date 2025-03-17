'use client';

import React, {useState} from 'react';
import axios from 'axios';
import Breadcrumbs from "@/components/Breadcrumbs";
import Cookies from 'js-cookie';
import {userService} from "@/services/userServices";
import {Turnstile} from "@marsidev/react-turnstile";

export default function Login() {

    interface UserData {
        username: string;
        email: string;
        token: string;
    }

    const [usermail, setusermail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState<boolean>(false); // 控制驗證狀態

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "登入" }
    ];


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // 阻止表單預設提交行為

        // 檢查 Turnstile 驗證是否完成
        if (!captchaToken) {
            setErrorMessage("請先完成驗證");
            return;
        }

        try {
            setIsVerifying(true); // 設置驗證進行中，避免重複請求

            // **Step 1: 驗證 Turnstile Captcha**
            const captchaResponse = await axios.post(
                "/api/verify",
                { token: captchaToken }, // 送出 Captcha Token
                { headers: { "Content-Type": "application/json" } }
            );

            if (!captchaResponse.data.success) {
                setErrorMessage("驗證失敗，請重新嘗試");
                setIsVerifying(false);
                return;
            }

            const response = await userService.Login(usermail,password)
            if (response.success && response.username && response.email && response.token) {
                // 登入成功，儲存用戶數據
                setUserData({
                    username: response.username,
                    email: response.email,
                    token: response.token
                });
                Cookies.set('name', response.username, { httponly: false, secure: true, expires: 7, sameSite: 'Strict' });
                Cookies.set('token', response.token, { httponly: false, secure: true, expires: 7, sameSite: 'Strict' });
                setErrorMessage('');
                window.location.replace('/home');
            }
            else {
                setErrorMessage(response.message);
            }

        } catch (error) {
            // Axios 會自動解析錯誤回應
            if (axios.isAxiosError(error) && error.response) {
                setErrorMessage(error.response.data?.message || '登陸失敗');
            } else {
                setErrorMessage('網路錯誤，請稍後再試');
            }
        } finally {
            setIsVerifying(false); // 完成請求後，解除驗證狀態
        }
    };
    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">

                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        登入
                    </h1>
                </div>
                <div className="card bg-base-100 shadow-xl w-96 p-6 mr-4">
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
                                        language: "zh-TW",
                                    }}
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
                        {errorMessage && <p role="alert" style={{color: 'red'}}>{errorMessage}</p>}
                        {userData && (
                            <div>
                                <h2 className="text-lg font-semibold mt-4">登入成功</h2>
                                <p>用戶名: {userData.username}</p>
                                <p>郵箱: {userData.email}</p>
                                <p>JWT: {userData.token}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
