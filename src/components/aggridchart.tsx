import React, {StrictMode,useState, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef} from "ag-grid-community";
import { AG_GRID_LOCALE_TW } from '@ag-grid-community/locale';
// All Community Features
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

// 定義資料的型別
interface RowData {
    category: string;
    value: number;
}


const App = () => {
    // 定義欄位
    const [columnDefs] = useState<ColDef[]>([
        { field: "category", headerName: "Category" },
        { field: "value", headerName: "Value" },
    ]);

    // 定義示例數據
    const [rowData] = useState<RowData[]>([
        { category: "A", value: 10 },
        { category: "B", value: 20 },
        { category: "C", value: 30 },
        { category: "D", value: 40 },
    ]);

    const gridRef = useRef<AgGridReact>(null);

    // 自動生成圓餅圖
    useEffect(() => {
        if (gridRef.current && gridRef.current.api) {
                gridRef.current.api.createRangeChart({
                cellRange: {
                    columns: ["category", "value"],
                },
                chartType: "pie", // 設置為圓餅圖
                chartThemeOverrides: {
                    pie: {
                        title: {
                            enabled: true,
                            text: "Pie Chart Example",
                            fontSize: 18,
                        },
                        legend: {
                            position: "right",
                        },
                    },
                },
            });
        }
    }, []);

    return (
        <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
            <AgGridReact
                localeText={AG_GRID_LOCALE_TW}
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                enableCharts={true}
                enableRangeSelection={true}
            />
        </div>
    );
};

export default function auditSuggest() {
    return (
        <StrictMode>
            <div className="w-full">
                <App/>
            </div>
        </StrictMode>
    );
}