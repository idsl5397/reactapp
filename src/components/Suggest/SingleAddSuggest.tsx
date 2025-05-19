'use client';

import React from 'react';
import SelectAddSuggest from "@/components/select/selectAddSuggest";

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


export default function SingleAddSuggest() {

    return (
        <>
            <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <SelectAddSuggest/>
                </div>
            </div>
            <div className="flex justify-end gap-x-8">
                <button type="button" className="btn btn-secondary">送出</button>
            </div>
        </>
    );
};