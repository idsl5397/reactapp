'use client';

import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/16/solid'
export default function Register() {
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
                                        <div
                                            className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                            <div
                                                className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6">
                                            </div>
                                            <input
                                                id="username"
                                                name="username"
                                                type="email"
                                                placeholder="輸入電子郵件"
                                                className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:col-span-5">
                                    <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                        姓名
                                    </label>
                                    <div className="mt-2">
                                        <div
                                            className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                            <div
                                                className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6">
                                            </div>
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                placeholder="輸入姓名"
                                                className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:col-span-5">
                                    <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                        密碼
                                    </label>
                                    <div className="mt-2">
                                        <div
                                            className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                            <div
                                                className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6">
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="輸入密碼"
                                                className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            />
                                        </div>
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
                                            autoComplete="enterprise-name"
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        >
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>Mexico</option>
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
                                            autoComplete="company-name"
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        >
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>Mexico</option>
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
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        >
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>Mexico</option>
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

                                </div>
                                <div className="sm:col-span-1">
                                    <fieldset>
                                        <h2 className="text-sm/6 font-semibold text-gray-900">Audit權限</h2>
                                        <div className="mt-6 space-y-6">
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    defaultChecked
                                                    id="audit-admin"
                                                    name="audit"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="audit-admin"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Admin
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
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Power
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
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Operator
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
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    None
                                                </label>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                                <div className="sm:col-span-1">
                                    <fieldset>
                                        <h2 className="text-sm/6 font-semibold text-gray-900">KPI權限</h2>
                                        <div className="mt-6 space-y-6">
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    defaultChecked
                                                    id="kpi-admin"
                                                    name="kpi"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="kpi-admin"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Admin
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="kpi-power"
                                                    name="kpi"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="kpi-power"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Power
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="kpi-operator"
                                                    name="kpi"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="kpi-operator"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Operator
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="kpi-none"
                                                    name="kpi"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="kpi-none"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    None
                                                </label>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                                <div className="sm:col-span-1">
                                    <fieldset>
                                        <h2 className="text-sm/6 font-semibold text-gray-900">Sys權限</h2>
                                        <div className="mt-6 space-y-6">
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    defaultChecked
                                                    id="system-admin"
                                                    name="system"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="system-admin"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Admin
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="system-none"
                                                    name="system"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="system-none"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    None
                                                </label>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                                <div className="sm:col-span-1">
                                    <fieldset>
                                        <h2 className="text-sm/6 font-semibold text-gray-900">Org權限</h2>
                                        <div className="mt-6 space-y-6">
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    defaultChecked
                                                    id="org-admin"
                                                    name="org"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="org-admin"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Admin
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="org-factory"
                                                    name="org"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="org-factory"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Factory
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="org-manager"
                                                    name="org"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="org-manager"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Manager
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="org-enterprise"
                                                    name="org"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="org-enterprise"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Enterprise
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-x-3">
                                                <input
                                                    id="org-company"
                                                    name="org"
                                                    type="radio"
                                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                                />
                                                <label htmlFor="org-company"
                                                       className="block text-sm/6 font-medium text-gray-900">
                                                    Company
                                                </label>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" className="text-sm/6 font-semibold text-gray-900">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </form>

</div>
    );
}