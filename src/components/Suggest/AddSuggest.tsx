'use client';

import React from 'react';
import Aggrid from "@/components/aggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectAddAll from "@/components/select/selectAddAll";
import Link from "next/link";

const rowData = [
    {
        id: 1,
        year: 2024,
        date: "03-18",
        event: "書面審查會議",
        vendor: "中油公司",
        category: "PSM",
        committee: "張委員",
        suggestion: "加強設備巡檢",
        suggestionType: "預防措施",
        department: "設備部",
        adoption: "是",
        improvement: "已增加每月巡檢頻率"
    },
];

const columnDefs = [
    { field: "id", headerName: "編號" },
    { field: "year", headerName: "年" },
    { field: "date", headerName: "月日" },
    { field: "event", headerName: "會議/活動" },
    { field: "vendor", headerName: "廠商" },
    { field: "category", headerName: "類別" },
    { field: "committee", headerName: "委員" },
    { field: "suggestion", headerName: "建議" },
    { field: "suggestionType", headerName: "建議類別" },
    { field: "department", headerName: "負責部門" },
    { field: "adoption", headerName: "是否參採" },
    { field: "improvement", headerName: "改善對策/辦理情形" }
];


export default function AddKPI() {
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告" , href: "/reportEntry" },
        { label: "新增委員建議"}
    ];

    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        新增委員建議
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
                                <Link href="">
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