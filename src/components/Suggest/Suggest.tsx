'use client';

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import Aggrid from "@/components/SuggestAggrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SelectionPayload } from "@/components/select/selectEnterprise";
import axios from 'axios';
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { AgGridReact } from "ag-grid-react";
import _ from 'lodash';
import { useauthStore } from "@/Stores/authStore";
import {getAccessToken} from "@/services/serverAuthService";

const breadcrumbItems = [
    { label: "首頁", href: "/" },
    { label: "委員回覆及改善建議" }
];

interface SuggestDto {
    id: number;
    date: string;
    organizationName: string;
    suggestEventTypeName: string;
}

const api = axios.create({ baseURL: "/proxy" });

const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {children}
            </div>
        </div>
    </div>
);

export default function Suggest() {
    const [rowData, setRowData] = useState<SuggestDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selection] = useState<SelectionPayload>({
        orgId: '',
        startYear: '',
        endYear: '',
        keyword: ''
    });
    const [keyword] = useState("");
    const [selectedOrgData, setSelectedOrgData] = useState<SuggestDto[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");

    const gridRef = useRef<AgGridReact>(null);
    const router = useRouter();

    const { userRole, userOrgId } = useauthStore();

    const handleQuery = async () => {
        setIsLoading(true);
        const params: any = {};
        const fullSelection = { ...selection, keyword };

        // 如果是公司層級，就強制覆蓋為自己的組織 ID
        if (userRole === 'company' && userOrgId) {
            params.organizationId = userOrgId;
        } else if (fullSelection.orgId && fullSelection.orgId.trim() !== '') {
            params.organizationId = fullSelection.orgId;
        }

        if (fullSelection.startYear != null) params.startYear = fullSelection.startYear;
        if (fullSelection.endYear != null) params.endYear = fullSelection.endYear;
        if (fullSelection.keyword?.trim()) params.keyword = fullSelection.keyword.trim();

        try {
            const token = await getAccessToken();
            const response = await api.get('/Suggest/GetAllSuggestData', {
                headers: {
                    Authorization: `Bearer ${token?.value}`
                },params });
            const raw = response.data;
            setRowData(raw);
            if (raw.length === 0) toast.success("查詢成功，但沒有符合條件的資料");
            else toast.success(`查詢成功，共 ${raw.length} 筆資料`);
        } catch (err) {
            toast.error("查詢失敗，請稍後再試");
        } finally {
            setIsLoading(false);
        }
    };

    const latestRowData = useMemo(() => {
        const grouped = _.groupBy(rowData, 'organizationName');
        return Object.values(grouped).map(group => _.orderBy(group, 'date', 'desc')[0]);
    }, [rowData]);

    const handleOpenOrgHistory = (orgName: string) => {
        const all = rowData.filter(r => r.organizationName === orgName);
        setSelectedOrgData(_.orderBy(all, 'date', 'desc'));
        setModalTitle(orgName);
        setModalOpen(true);
    };

    const columnDefs = [
        { field: "organizationName", headerName: "廠商" },
        { field: "date", headerName: "日期" },
        { field: "suggestEventTypeName", headerName: "會議/活動" },
        {
            headerName: "操作",
            field: "actions",
            cellRenderer: (params: any) => (
                <button
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => handleOpenOrgHistory(params.data.organizationName)}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    查看建議
                </button>
            )
        }
    ];

    useEffect(() => {
        const delay = setTimeout(() => { handleQuery(); }, 500);
        return () => clearTimeout(delay);
    }, [keyword]);

    useEffect(() => {
        const listener = (e: any) => {
            if (e.target.matches("[data-id]")) {
                const id = e.target.getAttribute("data-id");
                router.push(`/suggest/${id}`);
            }
        };
        document.addEventListener("click", listener);
        return () => document.removeEventListener("click", listener);
    }, []);

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#4ade80',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Background with gradient */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-slate-50 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Breadcrumbs items={breadcrumbItems}/>
                        <div className="mt-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                委員回覆及改善建議
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-4"></div>
                        </div>

                    </div>
                </div>
                {/* Main content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Action bar */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-600">
                            </div>
                        </div>

                        <Link href="/suggest/newSuggest" tabIndex={-1}>
                            <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 transform hover:scale-105">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                新增建議
                            </button>
                        </Link>
                    </div>

                    {/* Data table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">建議列表</h3>
                                    <p className="text-sm text-gray-600 mt-1">顯示各組織的最新建議記錄</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">即時更新</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-gray-600 text-lg">正在載入建議資料...</p>
                                    <p className="text-gray-500 text-sm mt-2">請稍候片刻</p>
                                </div>
                            ) : (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <Aggrid ref={gridRef} rowData={latestRowData} columnDefs={columnDefs} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Modal */}
            {modalOpen && (
                <Modal title={`${modalTitle} 歷史建議`} onClose={() => setModalOpen(false)}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">共 {selectedOrgData.length} 筆歷史記錄</span>
                        </div>

                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">會議/活動</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {selectedOrgData.map((item, index) => (
                                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.suggestEventTypeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button
                                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                                                data-id={item.id}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                查看建議
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}