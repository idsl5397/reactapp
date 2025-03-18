'use client';

import React from 'react';
import Aggrid from "@/components/aggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectAddAll from "@/components/select/selectAddAll";
import Link from "next/link";

const rowData = [
    {

    },

];

const columnDefs = [
    { field: "id", headerName: "編號" },
    { field: "company", headerName: "公司" },
    { field: "factory", headerName: "工廠/製程廠" },
    { field: "indicator", headerName: "指標項目" },
    { field: "indicatorDetail", headerName: "指標細項" },
    { field: "department", headerName: "單位" },
    { field: "isApplied", headerName: "是否應用" },
    { field: "baselineYear", headerName: "基線值數據年限" },
    { field: "baselineValue", headerName: "基線值" },
    { field: "q1Status", headerName: "111年Q1執行狀況" },
    { field: "q3Status", headerName: "111年Q3執行狀況" },
    { field: "targetValue", headerName: "目標值" }
];

export default function AddKPI() {
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告" , href: "/reportEntry" },
        { label: "新增績效指標"}
    ];

    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        新增績效指標
                    </h1>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <SelectAddAll/>

                        </div>
                        <div className="flex justify-end gap-x-8">
                            <Link href=" ">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                                >
                                    暫存至檢視
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="space-y-8 w-full mx-auto">
                            <p>檢視檔案</p>
                            <div className="mt-6 px-4 lg:px-6">
                                <Aggrid rowData={rowData} columnDefs={columnDefs} />
                            </div>
                            <div className="flex justify-end gap-x-8">
                                <Link href=" ">
                                    <button
                                        type="button"
                                        className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                                    >
                                        送出
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};