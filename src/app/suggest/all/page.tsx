'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import { useSearchParams } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AG_GRID_LOCALE_TW } from '@ag-grid-community/locale';
import { Toaster, toast } from 'react-hot-toast';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getAccessToken } from '@/services/serverAuthService';
import api from '@/services/apiService';
import SelectKpiEntriesByDate from "@/components/select/selectKpiEntriesByDate";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface SelectionPayload {
    orgId?: string;
    startYear?: string | number;
    endYear?: string | number;
    startQuarter?: string | number;
    endQuarter?: string | number;
    keyword?: string;
}
interface SuggestReport {
    id: number;
    organizationName?: string;
    date?: string;
    suggestEventTypeName?: string;
    userName?: string;
    suggestionContent?: string;
    suggestionTypeName?: string;
    respDept?: string;
    improveDetails?: string;
    isAdopted?: string;
    completed?: string;
    doneYear?: number;
    doneMonth?: number;
    parallelExec?: string;
    execPlan?: string;
    remark?: string;
    kpiFieldName?: string;
    manpower?: number;
    budget?: number;
}

export default function SuggestAllPage() {
    const sp = useSearchParams();

    // 只在第一次載入讀 URL orgId，避免後續 render 又把下拉重設為預設
    const initialOrgId = useMemo(() => sp.get('orgId') ?? '', []);

    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<SuggestReport[]>([]);
    const [keyword, setKeyword] = useState('');
    const [exportFilter, setExportFilter] = useState<'all' | 'incomplete'>('all');
    const gridRef = useRef<AgGridReact<SuggestReport>>(null);

    const categories = [
        { id: "cat_all", name: "全部" },
        { id: "製程安全管理", name: "製程安全管理" },
        { id: "環保管理", name: "環保管理" },
        { id: "消防管理", name: "消防管理" },
        { id: "能源管理", name: "能源管理" },
    ];
    const [activeTab, setActiveTab] = useState<string>("cat_all");

    const [activeType] = useState<"type_all" | "basic" | "custom">("type_all");
    const breadcrumbItems = [
        { label: '首頁', href: `${NPbasePath}/home` },
        { label: '委員回覆及改善建議', href: `${NPbasePath}/suggest` },
        { label: '詳情' },
    ];

    const cols: ColDef<SuggestReport>[] = [
        { field: 'organizationName', headerName: '廠商', hide: true },
        { field: 'date', headerName: '日期' },
        { field: 'suggestEventTypeName', headerName: '會議類型' },
        { field: 'userName', headerName: '委員' },
        { field: 'kpiFieldName', headerName: '類別' },
        { field: 'suggestionContent', headerName: '建議內容', flex: 2 },
        { field: 'suggestionTypeName', headerName: '建議類別' },
        { field: 'respDept', headerName: '責任部門' },
        { field: 'improveDetails', headerName: '改善對策', flex: 2},
        { field: 'isAdopted', headerName: '是否參採' },
        { field: 'completed', headerName: '是否完成' },
        { field: 'doneYear', headerName: '完成年' },
        { field: 'doneMonth', headerName: '完成月' },
        { field: 'parallelExec', headerName: '平行展開' , hide: true},
        { field: 'execPlan', headerName: '平行展開執行計畫' , hide: true},
        { field: 'manpower', headerName: '投入人力' , hide: true},
        { field: 'budget', headerName: '投入經費' , hide: true},
        { field: 'remark', headerName: '備註', flex: 1 , hide: true},
    ];

    // 統一的選擇狀態：用於顯示和查詢
    const [currentSelection, setCurrentSelection] = useState<SelectionPayload>({
        orgId: initialOrgId || '',
        startYear: '',
        endYear: '',
        startQuarter: '',
        endQuarter: '',
        keyword: '',
    });

    // 暫存選擇（用於查詢前的草稿狀態）
    const [tempSelection, setTempSelection] = useState<SelectionPayload>({
        orgId: initialOrgId || '',
        startYear: '',
        endYear: '',
        startQuarter: '',
        endQuarter: '',
        keyword: '',
    });

    // 只用 keyword 做全文搜索
    const searchKeyword = useMemo(() => keyword.trim(), [keyword]);

    // 組 API 參數：使用 currentSelection
    const buildParams = () => {
        const params: Record<string, any> = {};
        if (currentSelection.orgId && currentSelection.orgId !== '') {
            params.organizationId = currentSelection.orgId;
        }
        if (currentSelection.startYear) params.startYear = Number(currentSelection.startYear);
        if (currentSelection.endYear) params.endYear = Number(currentSelection.endYear);
        if (currentSelection.startQuarter) params.startQuarter = currentSelection.startQuarter;
        if (currentSelection.endQuarter) params.endQuarter = currentSelection.endQuarter;
        if (searchKeyword) params.keyword = searchKeyword;
        return params;
    };

    // 查詢（只有 currentSelection 或搜尋關鍵字變化時）
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchData = async () => {
            setLoading(true);
            try {
                const token = await getAccessToken();
                const params = buildParams();
                const res = await api.get('/Suggest/GetAllSuggest', {
                    headers: { Authorization: `Bearer ${token?.value}` },
                    params,
                    signal,
                });
                const data = res.data ?? [];
                setRows(data);
            } catch (err: any) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error(err);
                    toast.error('載入資料失敗');
                }
            } finally {
                setLoading(false);
            }
        };

        const t = setTimeout(fetchData, 300);
        return () => { clearTimeout(t); controller.abort(); };
    }, [
        currentSelection.orgId,
        currentSelection.startYear,
        currentSelection.endYear,
        currentSelection.startQuarter,
        currentSelection.endQuarter,
        searchKeyword
    ]);

    // 類別前端篩選
    const filteredRows = useMemo(() => {
        if (activeTab === "cat_all") return rows;
        return rows.filter(row => row.kpiFieldName?.includes(activeTab));
    }, [rows, activeTab]);

    // 按下查詢：把暫存選擇套用到當前選擇
    const handleQuery = () => {
        setCurrentSelection({...tempSelection});
    };

    // 同步選擇：讓暫存選擇等於當前選擇（用於重新顯示）
    const handleSyncSelection = () => {
        setTempSelection({...currentSelection});
    };

    // 重設功能：清除所有選擇條件
    const handleReset = () => {
        const resetSelection: SelectionPayload = {
            orgId: '',
            startYear: '',
            endYear: '',
            startQuarter: '',
            endQuarter: '',
            keyword: '',
        };
        setTempSelection(resetSelection);
        setCurrentSelection(resetSelection);
        setKeyword('');
    };

    const exportData = (type: 'excel' | 'csv') => {
        const apiGrid = gridRef.current?.api;
        if (!apiGrid) return;

        const fileName = `全部建議_${new Date().toISOString().slice(0, 10)}`;
        let exportRows = [...filteredRows];

        if (exportFilter === 'incomplete') {
            exportRows = exportRows.filter((r) => r.isAdopted === '是' && r.completed === '否');
        }

        const exportIds = new Set(exportRows.map((r) => r.id));

        if (type === 'excel') {
            apiGrid.deselectAll();
            apiGrid.forEachNode((n) => {
                if (n.data && exportIds.has(n.data.id)) n.setSelected(true);
            });
            apiGrid.exportDataAsExcel({ fileName: `${fileName}.xlsx`, onlySelected: true });
            apiGrid.deselectAll();
        } else {
            const displayedCols = apiGrid.getAllDisplayedColumns();
            const headers = displayedCols.map((c) => c.getColDef().headerName ?? c.getColId());
            const fields = displayedCols.map((c) => c.getColId());
            const csvRows = exportRows.map((r) => fields.map((f) => `"${(r as any)[f] ?? ''}"`).join(','));
            const csvContent = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `${fileName}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading && rows.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 text-lg">載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="bg-gradient-to-r from-slate-50 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Breadcrumbs items={breadcrumbItems} />
                        <div className="mt-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">委員回覆及改善建議詳情</h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-4"></div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* 查詢條件卡片 */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                                {/* Left: 日期 / 公司條件 */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></div>
                                        篩選條件
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <details className="group" open>
                                            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg transition-colors duration-200 custom-select">
                                                <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                    </svg>
                                                    選擇日期與公司條件
                                                </span>
                                                <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform duration-200"
                                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </summary>
                                            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                                                {/* 使用 key 來重新渲染組件以顯示當前選擇 */}
                                                <SelectKpiEntriesByDate
                                                    key={`${currentSelection.orgId}-${currentSelection.startYear}-${currentSelection.endYear}`}
                                                    onSelectionChange={(s) =>
                                                        setTempSelection(prev => ({
                                                            orgId: s.orgId ?? prev.orgId,
                                                            startYear: s.startYear ?? prev.startYear,
                                                            endYear: s.endYear ?? prev.endYear,
                                                            startQuarter: (s as any).startQuarter ?? prev.startQuarter,
                                                            endQuarter: (s as any).endQuarter ?? prev.endQuarter,
                                                            keyword: s.keyword ?? prev.keyword,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </details>
                                    </div>
                                </div>

                                {/* Right: 類別 + 查詢按鈕 */}
                                <div className="space-y-6 relative">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-6 bg-purple-500 rounded-full mr-3"></div>
                                            類別選擇
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                            {categories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    className={`btn flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm ${
                                                        activeTab === category.id
                                                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                                    }`}
                                                    onClick={() => setActiveTab(category.id)}
                                                >
                                                    <span className="truncate">{category.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 顯示當前選擇的摘要 */}
                                    {(currentSelection.orgId || currentSelection.startYear || currentSelection.endYear) && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <h4 className="text-sm font-medium text-blue-800 mb-2">當前篩選條件：</h4>
                                            <div className="text-xs text-blue-600 space-y-1">
                                                {currentSelection.orgId && <div>公司：{currentSelection.orgId}</div>}
                                                {(currentSelection.startYear || currentSelection.endYear) && (
                                                    <div>
                                                        年度：{currentSelection.startYear || '不限'} - {currentSelection.endYear || '不限'}
                                                    </div>
                                                )}
                                                {(currentSelection.startQuarter || currentSelection.endQuarter) && (
                                                    <div>
                                                        季度：{currentSelection.startQuarter || '不限'} - {currentSelection.endQuarter || '不限'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-4">
                                        <button
                                            type="button"
                                            className="btn flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-medium shadow-md text-sm"
                                            onClick={handleSyncSelection}
                                            title="重新顯示當前篩選條件"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                            </svg>
                                            同步
                                        </button>
                                        <button
                                            type="button"
                                            className="btn flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                                            onClick={handleReset}
                                            disabled={loading}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                            </svg>
                                            重設
                                        </button>
                                        <button
                                            type="button"
                                            className="btn flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-md transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                                            onClick={handleQuery}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    查詢中
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                                    </svg>
                                                    查詢
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* 控制列 */}
                        <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="搜尋建議內容..."
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <select
                                        aria-label="匯出選項"
                                        className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                        value={exportFilter}
                                        onChange={(e) => setExportFilter(e.target.value as 'all' | 'incomplete')}
                                    >
                                        <option value="all">匯出全部</option>
                                        <option value="incomplete">匯出未完成</option>
                                    </select>

                                    <button
                                        onClick={() => exportData('excel')}
                                        className="inline-flex items-center px-4 py-3 border border-green-300 rounded-xl text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none"
                                    >
                                        匯出 Excel
                                    </button>

                                    <button
                                        onClick={() => exportData('csv')}
                                        className="inline-flex items-center px-4 py-3 border border-blue-300 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none"
                                    >
                                        匯出 CSV
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 表格 */}
                        <div className="p-6">
                            <div className="ag-theme-quartz rounded-xl overflow-hidden shadow-sm border border-gray-200" style={{height: 700}}>
                                <AgGridReact
                                    ref={gridRef}
                                    localeText={AG_GRID_LOCALE_TW}
                                    rowData={filteredRows}
                                    quickFilterText={searchKeyword}
                                    columnDefs={cols}
                                    rowSelection="multiple"
                                    sideBar={{
                                        toolPanels: [
                                            { id: 'columns', labelDefault: '欄位', labelKey: 'columns', iconKey: 'columns', toolPanel: 'agColumnsToolPanel' },
                                            { id: 'filters', labelDefault: '篩選', labelKey: 'filters', iconKey: 'filter', toolPanel: 'agFiltersToolPanel' }
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
                                        cellStyle: {whiteSpace: 'normal', lineHeight: '1.5em'},
                                    }}
                                    pagination
                                    paginationPageSize={20}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}