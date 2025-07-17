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

interface SuggestDto {
    id: number;
    date: string;
    organizationName: string;
    suggestEventTypeName: string;
}

const api = axios.create({ baseURL: "/proxy" });

const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{title}</h3>
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>
            <div>{children}</div>
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
                    className="btn btn-outline btn-sm"
                    onClick={() => handleOpenOrgHistory(params.data.organizationName)}
                >查看建議</button>
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
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full flex justify-start">
                <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "委員回覆及改善建議" }]} />
            </div>

            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="relative space-y-8 w-full mx-auto">
                    <h1 className="text-center text-3xl font-bold text-gray-900">委員回覆及改善建議</h1>

                    <div className="h-12"/>

                    <div className="absolute top-0 right-0 z-10 mt-4 mr-4">
                        <Link href="/suggest/newSuggest" tabIndex={-1}>
                            <button className="btn btn-secondary text-white text-sm px-4 py-2 rounded-md">新增建議
                            </button>
                        </Link>
                    </div>

                    <div className="card bg-base-100 shadow-xl p-6 mt-6">
                        {isLoading ? (
                            <div className="skeleton w-full h-[600px] rounded-md"/>
                        ) : (
                            <Aggrid ref={gridRef} rowData={latestRowData} columnDefs={columnDefs}/>
                        )}
                    </div>
                </div>
            </div>

            {modalOpen && (
                <Modal title={`${modalTitle} 歷史建議`} onClose={() => setModalOpen(false)}>
                    <div className="overflow-y-auto max-h-[500px]">
                        <table className="table w-full">
                            <thead>
                            <tr>
                                <th>日期</th>
                                <th>會議/活動</th>
                                <th>操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedOrgData.map(item => (
                                <tr key={item.id}>
                                    <td>{item.date}</td>
                                    <td>{item.suggestEventTypeName}</td>
                                    <td><button className="btn btn-outline btn-xs" data-id={item.id}>查看建議</button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}
        </>
    );
}