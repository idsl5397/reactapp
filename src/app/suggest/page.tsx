'use client';

import React, {useState} from 'react';
import Aggrid from "@/components/aggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise from "@/components/select/selectEnterprise";
import Link from 'next/link';


const categories = [
    { id: "process", name: "製程安全管理" },
    { id: "env", name: "環保管理" },
    { id: "energy", name: "能源管理" },
    { id: "fire", name: "消防管理" }
];

export default function Suggest() {
    const [activeTab, setActiveTab] = useState("process");
    const [activeType, setActiveType] = useState("basic"); // 'basic' or 'custom'
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "委員回覆及改善建議" }
    ];

    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        委員回覆及改善建議
                    </h1>
                    <div className="mt-6 flex justify-center">
                        <input
                            type="text"
                            placeholder="請輸入關鍵字查詢..."
                            className="w-full max-w-5xl rounded-md border border-gray-300 px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>

                    <SelectEnterprise/>
                    <div className="flex justify-end gap-x-8">
                        <Link href="/kpi/newkpi">
                            <button
                                type="button"
                                className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            >
                                查詢
                            </button>
                        </Link>
                    </div>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="w-full mx-auto">

                            {/* AgGrid 表格 */}
                            <div className="mt-6 px-4 lg:px-6">
                                <Aggrid/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};