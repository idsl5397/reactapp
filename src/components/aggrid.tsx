import React, { useMemo, useState, useRef } from "react";
import { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact, AgGridReact as AgGridReactType } from "ag-grid-react";
import { AG_GRID_LOCALE_TW } from "@ag-grid-community/locale";

ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
    id: number;
    category: string; // PSM, EP, ...
    type: string;     // basic, custom
    [key: string]: any;
}

interface GridComponentProps {
    columnDefs: ColDef<IRow>[];
    rowData: IRow[];
    defaultColDef?: ColDef;
    activeCategory: string;
    activeType: string;
}

const GridComponent: React.FC<GridComponentProps> = ({
                                                         columnDefs,
                                                         rowData,
                                                         defaultColDef,
                                                         activeCategory,
                                                         activeType,
                                                     }) => {
    const [isEditable, setIsEditable] = useState(false);
    const [selectedRows, setSelectedRows] = useState<IRow[]>([]);
    const gridRef = useRef<AgGridReactType<IRow>>(null);

    // ✅ 根據條件過濾資料
    const filteredRowData = useMemo(() => {
        return rowData.filter((row) => {
            const matchCategory =
                activeCategory === "tab_all" || row.field === activeCategory; // ✅ 改用 field（中文類別）

            const matchType =
                activeType === "type_all" ||
                (activeType === "basic" && row.category === "基礎型") ||
                (activeType === "custom" && row.category === "客製型"); // ✅ 改用中文類型

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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
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
                <div className="text-center text-gray-500 mt-6">查無符合條件的資料</div>
            ) : (
                <div className="ag-theme-quartz-dark" style={{ width: "100%", height: "700px", marginTop: "20px" }}>
                    <AgGridReact
                        key={`${activeCategory}-${activeType}`}
                        ref={gridRef}
                        localeText={AG_GRID_LOCALE_TW}
                        rowData={filteredRowData}
                        columnDefs={[
                            ...(isEditable
                                ? [
                                    {
                                        headerCheckboxSelection: true,
                                        checkboxSelection: true,
                                        width: 50,
                                    },
                                ]
                                : []),
                            ...columnDefs.map((col) => ({
                                ...col,
                                editable: isEditable,
                            })),
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
        </div>
    );
};

export default GridComponent;