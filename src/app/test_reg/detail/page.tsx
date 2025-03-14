'use client';

import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import {Company, Enterprise, Factory} from "@/types/EnterPriseType";
import {enterpriseService} from "@/services/selectCompany";

// interface Enterprise {
//     id: string;
//     companyName: string;
//     children: Company[];
// }
//
// interface Company {
//     id: string;
//     companyName: string;
//     children: Factory[];
// }
//
// interface Factory {
//     id: string;
//     factoryName: string;
// }

export default function Detialreg() {

    const [data, setData] = useState<Enterprise[]>([]); // 保存企業數據
    const [selectedEnterprise, setSelectedEnterprise] = useState(""); // 選中的企業
    const [selectedCompany, setSelectedCompany] = useState(""); // 選中的公司
    const [companies, setCompanies] = useState<Company[]>([]); // 當前顯示的公司
    const [factories, setFactories] = useState<Factory[]>([]); // 當前顯示的工廠


    // 請求 API 獲取企業數據
    useEffect(() => {
        const fetchData = async () => {
            const x = await enterpriseService.fetchData();
            setData(x);
        };
        fetchData(); // 調用內部異步函式
    }, []);

    // 當選擇企業時更新公司列表
    const handleEnterpriseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const enterpriseId = e.target.value;
        setSelectedEnterprise(enterpriseId);
        // 根據選中的企業查找公司
        const enterprise = data.find((ent) => ent.id === enterpriseId);
        setCompanies(enterprise ? enterprise.children : []);
        setFactories([]); // 重置工廠
        setSelectedCompany(""); // 重置選中的公司
    };

    // 當選擇公司時更新工廠列表
    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        setSelectedCompany(companyId);

        // 根據選中的公司查找工廠
        const company = companies.find((comp) => comp.id === companyId);
        setFactories(company ? company.children : []);
    };

    //密碼強度
    const [password, setPassword] = useState("");
    const [strength, setStrength] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const checkStrength = (pwd: string) => {
        if (pwd.length === 0) {
            setStrength(null);
        } else if (pwd.length < 8) {
            setStrength("弱");
        } else if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd)) {
            setStrength("強");
        } else {
            setStrength("中");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        checkStrength(newPassword);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };
    const handleBlur = () => {
        if (password === "") {
            setStrength(null);
        }
    };

    return (

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                新增帳號
            </h1>
            <form>
                <div className="space-y-12">
                    <div className="card bg-base-100 shadow-xl p-6">
                        <div className="border-b border-gray-900/10 pb-12">
                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-5">
                                    <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                        電子郵件
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="username"
                                            name="username"
                                            type="email"
                                            placeholder="輸入電子郵件"
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-5">
                                    <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                        姓名
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            placeholder="輸入姓名"
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-5">
                                    <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                        密碼
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            value={password}
                                            type="password"
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            placeholder="輸入密碼"
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                        {/* 只有當 `isFocused` 為 true 才顯示提示 */}
                                        {isFocused && (
                                            <p
                                                className={`mt-2 text-sm font-medium ${
                                                    strength === "強"
                                                        ? "text-green-600"
                                                        : strength === "中"
                                                            ? "text-yellow-600"
                                                            : "text-red-600"
                                                }`}
                                            >
                                                密碼強度：{strength || "尚未輸入"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="sm:col-span-5">
                                    <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                        確認密碼
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="輸入密碼"
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="enterprise" className="block text-sm/6 font-medium text-gray-900">
                                        企業
                                    </label>
                                    <div className="mt-2 grid grid-cols-1">
                                        <select
                                            id="enterprise"
                                            name="enterprise"
                                            value={selectedEnterprise}
                                            onChange={handleEnterpriseChange}
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                        >
                                            <option value="">請選擇企業</option>
                                            {data.map((enterprise) => (
                                                <option key={enterprise.id} value={enterprise.id}>
                                                    {enterprise.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="company" className="block text-sm/6 font-medium text-gray-900">
                                        公司
                                    </label>
                                    <div className="mt-2 grid grid-cols-1">
                                        <select
                                            id="company"
                                            name="company"
                                            value={selectedCompany}
                                            onChange={handleCompanyChange}
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                            disabled={!companies.length} // 如果沒有公司數據則禁用
                                        >
                                            <option value="">請選擇公司</option>
                                            {companies.map((company) => (
                                                <option key={company.id} value={company.id}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="factory" className="block text-sm/6 font-medium text-gray-900">
                                        工廠
                                    </label>
                                    <div className="mt-2 grid grid-cols-1">
                                        <select
                                            id="factory"
                                            name="factory"
                                            autoComplete="factory-name"
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                            disabled={!factories.length} // 如果沒有工廠數據則禁用
                                        >
                                            <option value="">請選擇工廠</option>
                                            {factories.map((factory) => (
                                                <option key={factory.id} value={factory.id}>
                                                    {factory.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-gray-900/10 pb-12">
                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-1">
                                    <fieldset>
                                        <h2 className="text-sm/6 font-semibold text-gray-900">身分權限</h2>
                                        <div className="mt-6 flex flex-row items-center gap-x-6">
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    defaultChecked
                                                    id="audit-admin"
                                                    name="audit"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="audit-admin"
                                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                                    員工
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="audit-power"
                                                    name="audit"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="audit-power"
                                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                                    工廠主管
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="audit-operator"
                                                    name="audit"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="audit-operator"
                                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                                    公司主管
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="audit-none"
                                                    name="audit"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="audit-none"
                                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                                    政府監管者
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="audit-none"
                                                    name="audit"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="audit-none"
                                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                                    審查委員
                                                </label>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" className="text-sm/6 font-semibold text-gray-900 btn btn-ghost">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 btn btn-ghost"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </form>

        </div>
    );
}