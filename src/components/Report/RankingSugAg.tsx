'use client';
import { ICellRendererParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ValidationModule,
    PaginationModule, // ✅ 新增這行
    ModuleRegistry,
    CellStyleModule
} from 'ag-grid-community';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-quartz.css';   // 🆕 or quartz-dark
import axios from 'axios';
import {ColDef} from "ag-grid-community";

// 已有這行的話就加入到其中
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    PaginationModule, // ✅ 註冊這行
    CellStyleModule,
]);

type CompanyCompletionRankingDto = {
    organizationId: number;
    organizationName: string;
    completedYes: number;
    completedNo: number;
    total: number;
    completionRate: number;
};
type SuggestUncompletedDto = {
    id: number;
    date: string;
    suggestionContent: string;
    kpiField: string;
    eventType: string;
    respDept: string;
    remark: string;
    isAdopted: string;
};

const api = axios.create({ baseURL: '/proxy' });

export default function RankingSugAg() {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /** grid 資料 */
    const [rowData, setRowData] = useState<CompanyCompletionRankingDto[]>([]);
    /** loading state -> 控制 AG Grid overlay */
    const [loading, setLoading] = useState(true);

    const [selectedOrg, setSelectedOrg] = useState<CompanyCompletionRankingDto | null>(null);
    const [uncompletedList, setUncompletedList] = useState<SuggestUncompletedDto[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchUncompleted = async (org: CompanyCompletionRankingDto) => {
        try {
            const res = await api.get('/Report/uncompleted-suggestions', {
                params: { organizationId: org.organizationId },
            });
            setSelectedOrg(org);
            setUncompletedList(res.data);
            setModalOpen(true);
        } catch (err) {
            console.error('查詢失敗', err);
        }
    };

    /** 欄位定義 */
    const columnDefs: ColDef<CompanyCompletionRankingDto>[] = useMemo(() => [
        {
            headerName: '排名',
            valueGetter: (params) => `${params.node?.rowIndex != null ? params.node.rowIndex + 1 : ''}`,
            width: 70,
        },
        { headerName: '公司名稱', field: 'organizationName' },
        {
            headerName: '完成率 (%)',
            field: 'completionRate',
            valueFormatter: (params) => `${Math.round(params.value * 100)}%`,
        },
        {
            headerName: '完成 / 總數',
            valueGetter: (params) => `${params.data?.completedYes} / ${params.data?.total}`,
            hide: isMobile, // ✅ 在手機隱藏
        },
        {
            headerName: '視覺化',
            field: 'completionRate',
            flex: 1,
            cellRenderer: (p: ICellRendererParams<CompanyCompletionRankingDto, number>) => {
                const pct = Math.round((p.value ?? 0) * 100);
                return (
                    <div className="w-full h-3 bg-gray-200 rounded">
                        <div
                            className="h-full bg-green-500 rounded"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                );
            },
            hide: isMobile, // ✅ 在手機隱藏
        },
        {
            headerName: '內容',
            cellRenderer: (p: ICellRendererParams<CompanyCompletionRankingDto>) => (
                <div className="flex justify-end pr-2">
                    <button
                        className="text-blue-600 hover:underline whitespace-nowrap"
                        onClick={() => fetchUncompleted(p.data!)}
                    >
                        查看
                    </button>
                </div>
            ),
            width: 80,
            cellStyle: { whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'clip' },
        },
    ], [isMobile]);

    /** 取資料 */
    useEffect(() => {
        setLoading(true);
        api.get('/Report/completion-ranking')      // 不帶 topN -> 全部
            .then(res => setRowData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    /** gridReady 時顯示 overlay */
    const onGridReady = useCallback((params: any) => {
        if (loading) params.api.showLoadingOverlay();
    }, [loading]);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">改善建議完成率排行</h2>

            <div className="ag-theme-quartz h-[500px] rounded-lg shadow border border-gray-200">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination
                    paginationPageSize={10}          // ✅ 每頁 10 筆
                    suppressMovableColumns
                    onGridReady={onGridReady}
                    overlayLoadingTemplate={
                        `<div class="ag-overlay-loading-center">載入中…</div>`
                    }
                    overlayNoRowsTemplate={
                        `<span class="text-gray-500">沒有資料</span>`
                    }
                />
            </div>
            {modalOpen && selectedOrg && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50 transition-opacity animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl p-6 overflow-y-auto max-h-[80vh] border border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                📝 {selectedOrg.organizationName} 未完成建議清單（共 {uncompletedList.length} 筆）
                            </h3>
                            <button
                                className="text-gray-500 hover:text-red-500 transition btn"
                                onClick={() => setModalOpen(false)}
                            >
                                ✕ 關閉
                            </button>
                        </div>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full text-sm text-gray-800">
                                <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left">📅 日期</th>
                                    <th className="p-3 text-left w-[40%]">📌 建議內容</th>
                                    <th className="p-3 text-left">📂 類別</th>
                                    <th className="p-3 text-left">🏛️ 會議</th>
                                    <th className="p-3 text-left">👥 部門</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                {uncompletedList.map(item => (
                                    <tr key={item.id}>
                                        <td className="p-3 whitespace-nowrap">{item.date}</td>
                                        <td className="p-3 whitespace-normal break-words">{item.suggestionContent}</td>
                                        <td className="p-3">{item.kpiField}</td>
                                        <td className="p-3">{item.eventType}</td>
                                        <td className="p-3">{item.respDept}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}