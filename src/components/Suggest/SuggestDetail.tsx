'use client';

import {useEffect, useState, useRef, useMemo} from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import { AG_GRID_LOCALE_TW } from '@ag-grid-community/locale';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { Toaster } from 'react-hot-toast';
import Breadcrumbs from '@/components/Breadcrumbs';
ModuleRegistry.registerModules([AllEnterpriseModule]);

const api = axios.create({
    baseURL: '/proxy',
});

interface SuggestData {
    id: number;
    organizationName: string;
    date: string;
    suggestEventTypeName: string;
}

interface SuggestReport {
    id: number;
    organizationName: string;
    date: string;
    suggestEventTypeName: string;
    committee?: string;
    suggestion?: string;
    suggestionType?: string;
    respDept?: string;
    improveDetails?: string;
    isAdopted?: string;
    completed?: string;
    doneYear?: number;
    doneMonth?: number;
    parallelExec?: string;
    execPlan?: string;
    remark?: string;
    category?: string;
    manpower?: number;
    budget?: number;
}

export default function SuggestDetailPage() {
    const { id } = useParams();
    const gridRef = useRef<AgGridReact<SuggestReport>>(null);
    const [suggestData, setSuggestData] = useState<SuggestData | null>(null);
    const [reports, setReports] = useState<SuggestReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [exportFilter, setExportFilter] = useState<'all' | 'incomplete'>('all');

    const breadcrumbItems = [
        { label: '首頁', href: '/' },
        { label: '委員回覆及改善建議', href: '/suggest' },
        { label: '委員回覆及改善建議詳情' },
    ];

    const filteredReports = useMemo(() => {
        return reports.filter((r) =>
            Object.values(r)
                .filter(Boolean)
                .some((val) => val?.toString().toLowerCase().includes(keyword.toLowerCase()))
        );
    }, [reports, keyword]);

    const exportData = (type: 'excel' | 'csv') => {
        const api = gridRef.current?.api;
        if (!api) return;

        const fileName = `建議清單_${new Date().toISOString().slice(0, 10)}`;

        // 匯出資料來源使用完整 reports，而不是 filteredReports
        let exportRows = [...reports];

        if (exportFilter === 'incomplete') {
            exportRows = exportRows.filter(
                (r) => r.isAdopted === '是' && r.completed === '否'
            );
        }

        const exportIds = new Set(exportRows.map(r => r.id));

        if (type === 'excel') {
            api.deselectAll();
            api.forEachNode((node) => {
                if (node.data && exportIds.has(node.data.id)) {
                    node.setSelected(true);
                }
            });
            api.exportDataAsExcel({
                fileName: `${fileName}.xlsx`,
                onlySelected: true,
            });
            api.deselectAll();
        } else {
            const displayedCols = api.getAllDisplayedColumns();
            const headers = displayedCols.map((col) => col.getColDef().headerName ?? col.getColId());
            const fields = displayedCols.map((col) => col.getColId());

            const csvRows = exportRows.map((r) =>
                fields.map((field) => `"${(r as any)[field] ?? ''}"`).join(',')
            );

            const csvContent = [headers.join(','), ...csvRows].join('\n');

            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `${fileName}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const columnDefs: ColDef<SuggestReport>[] = [
        { field: 'organizationName', headerName: '廠商', hide: true },
        { field: 'date', headerName: '日期', hide: true },
        { field: 'suggestEventTypeName', headerName: '會議類型', hide: true },
        { field: 'committee', headerName: '委員' },
        { field: 'category', headerName: '類別' },
        { field: 'suggestion', headerName: '建議內容', flex: 2 },
        { field: 'suggestionType', headerName: '建議類別' },
        { field: 'respDept', headerName: '責任部門' },
        { field: 'improveDetails', headerName: '改善對策' },
        { field: 'isAdopted', headerName: '是否參採' },
        { field: 'completed', headerName: '是否完成' },
        { field: 'doneYear', headerName: '完成年' },
        { field: 'doneMonth', headerName: '完成月' },
        { field: 'parallelExec', headerName: '平行展開' },
        { field: 'execPlan', headerName: '執行計畫' },
        { field: 'manpower', headerName: '投入人力' },
        { field: 'budget', headerName: '投入經費' },
        { field: 'remark', headerName: '備註', flex: 1 },
    ];

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api
            .get(`/Suggest/GetSuggestDetail/${id}`)
            .then((res) => {
                setSuggestData(res.data);
                setReports(
                    (res.data.reports || []).map((r: SuggestReport) => ({
                        ...r,
                        organizationName: res.data.organizationName,
                        date: res.data.date,
                        suggestEventTypeName: res.data.suggestEventTypeName,
                    }))
                );
            })
            .catch((err) => console.error('取得詳情失敗', err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-6 text-gray-600">載入中...</div>;
    if (!suggestData) return <div className="p-6 text-red-600">找不到資料</div>;

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="relative space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        委員回覆及改善建議詳情
                    </h1>
                    <div className="p-6 space-y-8">
                        <h1 className="text-2xl font-bold text-gray-800">📌 主檔資訊</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border">
                            <div>
                                <strong>廠商：</strong>
                                {suggestData.organizationName}
                            </div>
                            <div>
                                <strong>日期：</strong>
                                {suggestData.date}
                            </div>
                            <div>
                                <strong>會議類型：</strong>
                                {suggestData.suggestEventTypeName}
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-700">📋 對應建議列表</h2>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="請輸入關鍵字查詢..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-md"
                            />
                            <div className="flex gap-2 items-center">
                                <select
                                    className="select select-sm select-bordered"
                                    value={exportFilter}
                                    onChange={(e) => setExportFilter(e.target.value as 'all' | 'incomplete')}
                                >
                                    <option value="all">匯出全部</option>
                                    <option value="incomplete">匯出未完成</option>
                                </select>
                                <button onClick={() => exportData('excel')} className="btn btn-outline btn-sm">
                                    匯出 Excel
                                </button>
                                <button onClick={() => exportData('csv')} className="btn btn-outline btn-sm">
                                    匯出 CSV
                                </button>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl p-6 mt-6">
                            {loading ? (
                                <div className="flex flex-col gap-4">
                                    <div className="skeleton h-[600px] rounded-md" />
                                </div>
                            ) : filteredReports.length === 0 ? (
                                <div className="text-gray-500">查無符合條件的建議</div>
                            ) : (
                                <div className="ag-theme-quartz h-[600px] mb-6 border">
                                    <AgGridReact
                                        ref={gridRef}
                                        localeText={AG_GRID_LOCALE_TW}
                                        rowData={filteredReports}
                                        columnDefs={columnDefs}
                                        rowSelection="multiple"
                                        sideBar={{
                                            toolPanels: [
                                                {
                                                    id: 'columns',
                                                    labelDefault: '欄位',
                                                    labelKey: 'columns',
                                                    iconKey: 'columns',
                                                    toolPanel: 'agColumnsToolPanel',
                                                },
                                                {
                                                    id: 'filters',
                                                    labelDefault: '篩選',
                                                    labelKey: 'filters',
                                                    iconKey: 'filter',
                                                    toolPanel: 'agFiltersToolPanel',
                                                },
                                            ],
                                            defaultToolPanel: '',
                                        }}
                                        defaultColDef={{
                                            sortable: true,
                                            filter: true,
                                            resizable: true,
                                            flex: 1,
                                            wrapText: true,
                                            autoHeight: true,
                                            cellStyle: {whiteSpace: 'normal', lineHeight: '1.4em'},
                                        }}
                                        pagination={true}
                                        paginationPageSize={10}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
