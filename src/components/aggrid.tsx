import React, { useMemo, useState, useRef } from "react";
import {ColDef, ModuleRegistry} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact, AgGridReact as AgGridReactType } from "ag-grid-react";
import { AG_GRID_LOCALE_TW } from "@ag-grid-community/locale";

ModuleRegistry.registerModules([AllEnterpriseModule]);


interface IRow {
    id: number;
    category: string; // e.g. "基礎型", "客製型"
    type: string;     // e.g. "basic", "custom"
    [key: string]: any;
}

interface GridComponentProps {
    columnDefs: ColDef<IRow>[];
    rowData: IRow[];
    defaultColDef?: ColDef;
    activeCategory: string;
    activeType: string;
    columnTitleMap: Record<string, string>;
}

const GridComponent: React.FC<GridComponentProps> = ({
                                                         columnDefs,
                                                         rowData,
                                                         defaultColDef,
                                                         activeCategory,
                                                         activeType,
                                                         columnTitleMap
                                                     }) => {
    const [isEditable, setIsEditable] = useState(false);
    const [selectedRows, setSelectedRows] = useState<IRow[]>([]);
    const [selectedDetail, setSelectedDetail] = useState<IRow | null>(null);
    const gridRef = useRef<AgGridReactType<IRow>>(null);


    //匯出excel與CSV
    const exportToExcel = () => {
        gridRef.current?.api.exportDataAsExcel({
            fileName: `指標資料_${new Date().toISOString().slice(0, 10)}.xlsx`,
        });
    };
    const exportToCsv = () => {
        gridRef.current?.api.exportDataAsCsv({
            fileName: `指標資料_${new Date().toISOString().slice(0, 10)}.csv`,
        });
    };

    const filteredRowData = useMemo(() => {
        return rowData.filter((row) => {
            const matchCategory =
                activeCategory === "tab_all" || row.field === activeCategory;
            const matchType =
                activeType === "type_all" ||
                (activeType === "basic" && row.category === "基礎型") ||
                (activeType === "custom" && row.category === "客製型");
            return matchCategory && matchType;
        });
    }, [rowData, activeCategory, activeType]);

    const toggleEditMode = () => {
        setIsEditable((prev) => !prev);
        setSelectedRows([]);
    };

    const onSelectionChanged = (event: any) => {
        setSelectedRows(event.api.getSelectedRows());
    };

    const deleteSelectedRows = () => {
        if (selectedRows.length === 0) return alert("請先選擇要刪除的資料！");
        alert("⚠️ 僅從畫面中刪除，未同步後端");
        setSelectedRows([]);
    };

    // ✅ 建議寫法：使用 AG Grid 內建的選擇欄位類型
    const checkboxSelectionCol: ColDef = {
        type: "agCheckboxSelectionColumn",
        width: 50,
        pinned: "left",
        suppressSizeToFit: true,
    };

    const actionColumn: ColDef = {
        headerName: "操作",
        field: "actions",
        pinned: "right",
        width: 120,
        cellRenderer: (params: any) => (
            <span
                className="text-blue-600 text-sm hover:underline cursor-pointer"
                onClick={() => setSelectedDetail(params.data)}
            >
                查看詳情
            </span>
        )
    };


    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
            <button
                    onClick={toggleEditMode}
                    className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                >
                    {isEditable ? "鎖定" : "修改"}
                </button>
                {isEditable && (
                    <button
                        onClick={deleteSelectedRows}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                        刪除選擇
                    </button>
                )}

                <button
                    onClick={exportToExcel}
                    className="btn btn-outline px-4 py-2 text-sm rounded-md"
                >
                    匯出 Excel
                </button>
                <button
                    onClick={exportToCsv}
                    className="btn btn-outline px-4 py-2 text-sm rounded-md"
                >
                    匯出 CSV
                </button>
            </div>

            <p className="text-sm text-gray-500 px-1">
                類別：{activeCategory === "tab_all" ? "全部類別" : activeCategory}，
                指標類型：
                {activeType === "type_all"
                    ? "全部"
                    : activeType === "basic"
                        ? "基礎型"
                        : "客製型"}
            </p>

            {filteredRowData.length === 0 ? (
                <div className="text-center text-gray-500 mt-6">
                    查無符合條件的資料
                </div>
            ) : (
                <div
                    className="ag-theme-quartz-dark"
                    style={{width: "100%", height: "700px", marginTop: "20px"}}
                >
                    <AgGridReact
                        key={`${activeCategory}-${activeType}`}
                        ref={gridRef}
                        localeText={AG_GRID_LOCALE_TW}
                        rowData={filteredRowData}
                        sideBar
                        columnDefs={[
                            ...(isEditable ? [checkboxSelectionCol] : []),
                            ...columnDefs.map((col) => ({
                                ...col,
                                editable: isEditable,
                            })),
                            actionColumn
                        ]}
                        defaultColDef={{
                            flex: 1,
                            sortable: true,
                            filter: true,
                            resizable: true,
                            editable: isEditable,
                            ...defaultColDef,
                        }}
                        rowSelection="multiple"
                        onSelectionChanged={onSelectionChanged}
                        animateRows={true}
                        pagination={true}
                        paginationPageSize={20}
                        singleClickEdit={true}
                        stopEditingWhenCellsLoseFocus={true}
                    />
                </div>
            )}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl relative">
                        <h2 className="text-xl font-semibold mb-4">指標詳情</h2>
                        <ul className="space-y-2 text-sm max-h-[400px] overflow-y-auto">
                            {Object.entries(selectedDetail).map(([key, value]) => (
                                <li key={key}>
                                    <strong>{columnTitleMap[key] || key}：</strong>
                                    {key === "reports" && Array.isArray(value) ? (
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            {value.map((report: any, idx: number) => (
                                                <li key={idx}>
                                                    {report.year}_{report.period}：{report.kpiReportValue}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span> {String(value ?? "-")}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => setSelectedDetail(null)}
                            className="absolute top-2 right-2 btn btn-sm btn-circle btn-outline"
                            title="關閉"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GridComponent;