

'use client';

import Breadcrumbs from "@/components/Breadcrumbs";
import React from "react";

export default function Direction(){

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "關於我們" }
    ];

    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        關於我們
                    </h1>
                    <div className="card bg-base-100 shadow-xl p-6 mt-6 max-w-3xl w-full mx-auto">
                    <div className="card-body">
                            <h2 className="card-title">平台簡介</h2>
                            <p className="text-gray-700">
                                本平台由工安協會協助開發，專為政府單位與企業提供績效指標監管的數位化工具。
                                透過數據分析與審查紀錄，協助政府機構掌握企業的績效達成情形，並推動產業安全標準的持續提升。
                            </p>

                            <h2 className="mt-6 text-lg font-semibold text-gray-800">平台功能</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>監管企業績效指標的達成狀況</li>
                                <li>記錄與管理工安審查委員的審查結果與建議</li>
                                <li>提供企業即時查閱審查紀錄與改善建議</li>
                                <li>促進政府、企業與審查委員之間的有效溝通</li>
                            </ul>

                            <h2 className="mt-6 text-lg font-semibold text-gray-800">使用對象</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>政府單位：負責監管企業績效並制定安全政策</li>
                                <li>企業管理者：查閱與上傳績效指標與改善建議狀況</li>
                                <li>工安審查委員：查看提交之審查意見</li>
                            </ul>

                            <p className="mt-4 text-gray-700">
                                為確保數據的準確性與安全性，本平台採用手動審核機制，僅限符合資格的政府機構與企業管理者註冊使用。
                                我們致力於推動工業安全管理數位化，促進企業與監管機構之間的合作，共同提升產業安全標準。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}