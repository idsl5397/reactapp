import React, {useState, useRef} from "react";
import { AgGridReact } from 'ag-grid-react';
import {ColDef, ModuleRegistry} from 'ag-grid-community';
import { AG_GRID_LOCALE_TW } from "@ag-grid-community/locale";
import {AllEnterpriseModule} from "ag-grid-enterprise";
ModuleRegistry.registerModules([AllEnterpriseModule]);
import * as XLSX from "xlsx";

interface AggridProps {
    columnDefs: ColDef[];
    rowData: any[];
}

const SuggestAggrid: React.FC<AggridProps> = ({ columnDefs, rowData }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [exportMode, setExportMode] = useState<"all" | "failed">("all");
    //匯出excel與CSV
    const exportData = (type: "excel" | "csv") => {
        const api = gridRef.current?.api;
        if (!api) return;

        const today = new Date().toISOString().slice(0, 10);

        // 匯出所有資料（篩選後結果）
        if (exportMode === "all") {
            const fileName = `委員建議_${today}.${type === "excel" ? "xlsx" : "csv"}`;
            const options = {
                fileName,
                processHeaderCallback: (params: any) =>
                    params.column.getColDef().headerName || params.column.getColDef().field,
                processCellCallback: (params: any) =>
                    params.value ?? "-",
            };

            type === "excel"
                ? api.exportDataAsExcel(options)
                : api.exportDataAsCsv(options);

            return;
        }

        // 匯出未達標資料（未完成改善）
        const failedRows: any[] = [];
        api.forEachNodeAfterFilterAndSort((node) => {
            const row = node.data;
            if (!row) return;

            if (row.completed === true) return; // 已完成則略過

            failedRows.push(row);
        });

        const failedRowsWithHeader = failedRows.map(row => {
            const newRow: any = {};
            Object.keys(row).forEach(key => {
                const colDef = columnDefs.find(col => col.field === key);
                const label = colDef?.headerName || key;
                newRow[label] = row[key];
            });
            return newRow;
        });

        const fileName = `委員建議_未完成_${today}.${type === "excel" ? "xlsx" : "csv"}`;
        const worksheet = XLSX.utils.json_to_sheet(failedRowsWithHeader);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "未完成改善");

        if (type === "excel") {
            XLSX.writeFile(workbook, fileName);
        } else {
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            const bom = "\uFEFF";
            const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <select
                    className="select select-bordered"
                    value={exportMode}
                    onChange={(e) => setExportMode(e.target.value as any)}
                >
                    <option value="all">匯出篩選結果</option>
                    <option value="failed">匯出篩選結果未達標</option>
                </select>
                <button className="btn btn-outline" onClick={() => exportData("excel")}>匯出 Excel</button>
                <button className="btn btn-outline" onClick={() => exportData("csv")}>匯出 CSV</button>
            </div>
            <div className="ag-theme-quartz-dark" style={{height: '600px', width: '100%'}}>
                <AgGridReact
                    localeText={AG_GRID_LOCALE_TW}
                    ref={gridRef}
                    columnDefs={columnDefs}
                    rowData={rowData}
                    sideBar={{
                        toolPanels: [
                            {
                                id: 'columns',
                                labelDefault: '欄位',
                                labelKey: 'columns',
                                iconKey: 'columns',
                                toolPanel: 'agColumnsToolPanel',
                            }
                        ],
                    }}
                    pagination={true}
                    paginationPageSize={20}
                    defaultColDef={{
                        flex: 1,
                        sortable: true,
                        resizable: true,
                        filter: true,
                    }}
                />
            </div>
        </div>
    );
};

export default SuggestAggrid;