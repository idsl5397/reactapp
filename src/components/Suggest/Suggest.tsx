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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import _ from 'lodash';

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
    const [selection, setSelection] = useState<SelectionPayload>({
        orgId: '',
        startYear: '',
        endYear: '',
        keyword: ''
    });
    const [keyword, setKeyword] = useState("");
    const [exportMode, setExportMode] = useState<"all" | "failed">("all");
    const [selectedOrgData, setSelectedOrgData] = useState<SuggestDto[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");

    const gridRef = useRef<AgGridReact>(null);
    const router = useRouter();

    const handleQuery = async () => {
        setIsLoading(true);
        const params: any = {};
        const fullSelection = { ...selection, keyword };

        if (fullSelection.orgId != null) params.organizationId = fullSelection.orgId;
        if (fullSelection.startYear != null) params.startYear = fullSelection.startYear;
        if (fullSelection.endYear != null) params.endYear = fullSelection.endYear;
        if (fullSelection.keyword?.trim()) params.keyword = fullSelection.keyword.trim();

        try {
            const response = await api.get('/Suggest/GetAllSuggestData', { params });
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

    const exportData = async (type: "excel" | "csv") => {
        const api = gridRef.current?.api;
        if (!api) return;
        const today = new Date().toISOString().slice(0, 10);

        if (exportMode === "all") {
            const fileName = `委員建議_${today}.${type === "excel" ? "xlsx" : "csv"}`;
            const options = {
                fileName,
                processHeaderCallback: (params: any) => params.column.getColDef().headerName || params.column.getColDef().field,
                processCellCallback: (params: any) => params.value ?? "-",
            };
            type === "excel" ? api.exportDataAsExcel(options) : api.exportDataAsCsv(options);
            return;
        }

        const failedRows: any[] = [];
        api.forEachNodeAfterFilterAndSort((node) => {
            const row = node.data;
            if (!row || row.completed === true) return;
            failedRows.push(row);
        });

        const failedRowsWithHeader = failedRows.map(row => {
            const newRow: any = {};
            Object.keys(row).forEach(key => {
                const colDef = columnDefs.find(col => col.field === key);
                newRow[colDef?.headerName || key] = row[key];
            });
            return newRow;
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("未完成改善");
        if (failedRowsWithHeader.length > 0) {
            sheet.columns = Object.keys(failedRowsWithHeader[0]).map(key => ({ header: key, key, width: 20 }));
            failedRowsWithHeader.forEach(row => sheet.addRow(row));
        }
        const fileName = `委員建議_未完成_${today}.${type === "excel" ? "xlsx" : "csv"}`;
        if (type === "excel") {
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), fileName);
        } else {
            const csvRows = [sheet.columns!.map(col => col.header).join(',')];
            failedRowsWithHeader.forEach(row => {
                const values = sheet.columns!.map(col => row[col.header! as string] ?? '');
                csvRows.push(values.join(','));
            });
            const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, fileName);
        }
    };

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