import React from "react";
import { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { AG_GRID_LOCALE_TW } from "@ag-grid-community/locale";

ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
    [key: string]: any; // 允許動態欄位
}

interface GridComponentProps {
    columnDefs: ColDef<IRow>[]; // 欄位定義
    rowData: IRow[]; // 資料
    defaultColDef?: ColDef; // 預設欄位設定（可選）
}

const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

const GridComponent: React.FC<GridComponentProps> = ({
                                                         columnDefs,
                                                         rowData,
                                                         defaultColDef,
                                                     }) => {
    return (
        <div
            className="ag-theme-quartz-dark z-1"
            style={{
                width: "100%",
                height: "700px",
                marginTop: "20px",
                zIndex: 1,
            }}
        >
            <AgGridReact
                localeText={AG_GRID_LOCALE_TW}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={{
                    flex: 1,
                    sortable: true,
                    filter: true,
                    resizable: true,
                    editable: true,
                    ...defaultColDef, // 合併外部傳入的預設欄位設定
                }}
                animateRows={true}
                pagination={true}
                paginationPageSize={20}
                singleClickEdit={true}
                stopEditingWhenCellsLoseFocus={true}
            />
        </div>
    );
};

export default GridComponent;