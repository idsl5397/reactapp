'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function Login() {

    interface UserData {
        username: string;
        email: string;
    }

    const [username, setusername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userData, setUserData] = useState<UserData | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // 阻止表單預設提交行為

        try {
            const response = await fetch('https://localhost:7199/api/User/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                // 如果後端返回的狀態不是 200，則處理錯誤
                const errorData = await response.json();
                setErrorMessage(errorData.message || '登陸失敗');
                return;
            }

            const data = await response.json();
            setUserData(data); // 儲存成功的用戶數據
            setErrorMessage(''); // 清空錯誤訊息
            router.push('/home');
        } catch (error) {
            console.error('網路錯誤:', error);
            setErrorMessage('網路錯誤，請稍後再試');
        }
    };
    return (
        <>
            {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
            <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8">

                <div className="sm:mx-auto sm:w-full sm:max-w-sm">

                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        登入
                    </h1>
                </div>
                <div className="card bg-base-100 shadow-xl w-96 p-6 mr-4">
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                    帳號
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setusername(e.target.value)}
                                        required
                                        autoComplete="email"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div className="pb-12">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                        密碼
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
                            <div className="grid gap-x-8">
                                <button
                                    type="submit"
                                    className="flex btn btn-primary w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm "
                                >
                                    登入
                                </button>
                            </div>
                        </form>
                        {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
                        {userData && (
                            <div>
                                <h2>登陸成功</h2>
                                <p>用戶名: {userData.username}</p>
                                <p>郵箱: {userData.email}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
