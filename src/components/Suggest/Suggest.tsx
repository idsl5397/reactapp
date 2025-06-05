'use client';

import React, { useState } from 'react';
import Aggrid from "@/components/SuggestAggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectEnterprise";
import axios from 'axios';
import Link from "next/link";
import {toast} from "react-hot-toast";

const api = axios.create({
    baseURL: "/proxy",
});
const columnDefs = [
    { field: "organizationName", headerName: "廠商" },
    { field: "date", headerName: "日期" },
    { field: "suggestEventTypeName", headerName: "會議/活動" },
    { field: "kpiFieldName", headerName: "類別" },
    { field: "userName", headerName: "委員" },
    { field: "suggestionTypeName", headerName: "建議類別" },
    { field: "respDept", headerName: "負責部門" },
    { field: "isAdopted", headerName: "是否參採" },
    { field: "completed", headerName: "是否完成改善辦理" },
    { field: "improveDetails", headerName: "改善對策/辦理情形" }
];

export default function Suggest() {
    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selection, setSelection] = useState<SelectionPayload>({
        orgId: '',
        startYear: '',
        endYear: ''
    });

    const handleQuery = async () => {
        setIsLoading(true);
        const params: any = {};
        if (selection.orgId != null) params.organizationId = selection.orgId;
        if (selection.startYear != null) params.startYear = selection.startYear;
        if (selection.endYear != null) params.endYear = selection.endYear;

        try {
            const response = await api.get('/Suggest/GetAllSuggest', { params });
            console.log(response.data);
            if (response.data) {
                const raw = response.data;
                console.log("1");
                setRowData(raw);
                if (raw.length === 0) {
                    toast.success("查詢成功，但沒有符合條件的資料");
                } else {
                    toast.success(`查詢成功，共 ${raw.length} 筆資料`);
                }
            }
        } catch (err) {
            console.error("取得建議失敗", err);
            toast.error("查詢失敗，請稍後再試");
        } finally {
            setIsLoading(false);
        }
    };

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
                <div className="relative space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">委員回覆及改善建議</h1>
                    <div className="mt-6 flex justify-center">
                        <input
                            type="text"
                            placeholder="請輸入關鍵字查詢..."
                            className="w-full max-w-5xl rounded-md border border-gray-300 px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>
                    <div className="flex justify-end gap-x-8">
                        <Link href="/suggest/newSuggest" tabIndex={-1}>
                            <button
                                type="button"
                                className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            >
                                新增建議
                            </button>
                        </Link>
                    </div>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <SelectEnterprise onSelectionChange={(s) => setSelection(s)}/>
                        </div>
                    </div>

                    <div className="flex justify-end gap-x-8">
                        <button
                            type="button"
                            className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            onClick={handleQuery}
                        >
                            {isLoading ? '查詢中...' : '查詢'}
                        </button>
                    </div>

                    <div className="card bg-base-100 shadow-xl p-6 mt-6">
                        {isLoading ? (
                            <div className="text-center text-gray-500">資料載入中…</div>
                        ) : (
                            <Aggrid rowData={rowData} columnDefs={columnDefs}/>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}