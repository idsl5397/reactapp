import React, { useState } from "react";
import { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { AG_GRID_LOCALE_TW } from "@ag-grid-community/locale";

ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
    id: number;
    [key: string]: any; // 允許動態欄位
}

interface GridComponentProps {
    columnDefs: ColDef<IRow>[]; // 欄位定義
    rowData: IRow[]; // 資料
    defaultColDef?: ColDef; // 預設欄位設定（可選）
}

const GridComponent: React.FC<GridComponentProps> = ({ columnDefs, rowData, defaultColDef }) => {
    const [isEditable, setIsEditable] = useState(false);
    const [gridData, setGridData] = useState(rowData);
    const [selectedRows, setSelectedRows] = useState<IRow[]>([]);

    // 切換編輯模式
    const toggleEditMode = () => {
        setIsEditable((prev) => !prev);
        setSelectedRows([]); // 退出編輯模式時清空選擇
    };

    // 取得選中的行
    const onSelectionChanged = (event: any) => {
        setSelectedRows(event.api.getSelectedRows());
    };

    // 刪除選擇的行
    const deleteSelectedRows = () => {
        if (selectedRows.length === 0) return alert("請先選擇要刪除的資料！");
        const newData = gridData.filter(row => !selectedRows.includes(row));
        setGridData(newData);
        setSelectedRows([]); // 清空選擇
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <button onClick={toggleEditMode} className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md">{isEditable ? "鎖定" : "修改"}</button>
                {isEditable && (
                    <button onClick={deleteSelectedRows} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                        刪除選擇
                    </button>
                )}
            </div>

            <div className="ag-theme-quartz-dark" style={{ width: "100%", height: "700px", marginTop: "20px" }}>
                <AgGridReact
                    localeText={AG_GRID_LOCALE_TW}
                    rowData={gridData}
                    columnDefs={[
                        ...(isEditable
                            ? [
                                {
                                    headerCheckboxSelection: true, // 讓表頭顯示「全選」按鈕
                                    checkboxSelection: true, // 讓每行有勾選框
                                    width: 50,
                                },
                            ]
                            : []), // 當 `isEditable === false` 時，不顯示 checkbox
                        ...columnDefs.map((col) => ({
                            ...col,
                            editable: isEditable, // 只有在編輯模式時可編輯
                        })),
                    ]}
                    defaultColDef={{
                        flex: 1,
                        sortable: true,
                        filter: true,
                        resizable: true,
                        editable: isEditable, // 影響所有欄位的可編輯性
                        ...defaultColDef,
                    }}
                    rowSelection="multiple" // 允許多選
                    onSelectionChanged={onSelectionChanged} // 監聽勾選變化
                    animateRows={true}
                    pagination={true}
                    paginationPageSize={20}
                    singleClickEdit={true}
                    stopEditingWhenCellsLoseFocus={true}
                />
            </div>
        </div>
    );
};

export default GridComponent;
