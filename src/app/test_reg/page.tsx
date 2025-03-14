'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';

export default function Reg() {
    const [isLoading, setIsLoading] = useState(false);
    const [data] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const api = axios.create({
        baseURL: '/proxy',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);  // 開始加載
        console.log("Email to send:", email);

        try {
            const response = await api.post(`/verify-email?email=${encodeURIComponent(email)}`);
            console.log("gooood");

            if (response.status !== 200) {
                throw new Error("Email 驗證失敗");
            }

            // const data = response.data;
            // setData(data);  // 成功後設置 data
            // router.push(`/test_reg/detail?company=${encodeURIComponent(data.companyId.result)}`);
            axios.post('/register/detail', {
                companyId: data.companyId.result  // 將需要傳遞的資料放在請求體中
            })
                .then((response) => {
                    // 請求成功後，跳轉到新頁面
                    router.push('/register/detail');
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            setError("Email 驗證失敗，請重試");
        } finally {
            setIsLoading(false);  // 加載結束
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8">
            <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                新增帳號
            </h1>
            <div className="space-y-12">
                <div className="card bg-base-100 shadow-xl w-96 p-6 mr-4">
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        {isLoading ? (
                            <div className="text-center">正在處理中...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="pb-12">
                                    <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                        電子郵件
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="輸入電子郵件"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-x-8">
                                    <button
                                        type="submit"
                                        className="flex btn btn-primary w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm "
                                    >
                                        下一步
                                    </button>
                                </div>
                            </form>
                        )}
                        {error && <div className="text-red-500 mt-2">{error}</div>} {/* 顯示錯誤訊息 */}

                        {data && (
                            <div className="mt-4">
                                <h2>獲取的數據:</h2>
                                <pre>{JSON.stringify(data, null, 2)}</pre> {/* 以 JSON 格式顯示 data */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
