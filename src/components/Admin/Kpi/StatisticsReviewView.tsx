"use client";
export default function StatisticsReviewView() {
    return (
        <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">達標統計與審核</h3>
            <p className="text-sm text-gray-500 mb-4">此頁聚焦 KPI 達標率、未達標清單、以及報告狀態流轉（Draft→Submitted→Reviewed→…）。</p>
            <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2">達標率（彙總）</div>
                    <div className="text-gray-500 text-sm">（待接 API，放圖表/指標卡）</div>
                </div>
                <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2">未達標清單</div>
                    <div className="text-gray-500 text-sm">（待接 /Report/unmet-kpi 類 API）</div>
                </div>
            </div>
            <div className="mt-6 border rounded-lg p-4">
                <div className="font-medium mb-2">狀態批次流轉</div>
                <div className="text-gray-500 text-sm">（提供條件查詢 + 勾選批次修改狀態，呼叫 PATCH
                    /Admin/kpi/reports/status）
                </div>
                {/*<div className="text-gray-500 text-sm">（提供條件查詢 + 勾選批次修改狀態，呼叫 PATCH*/}
                {/*    /Admin/kpi/reports/{id}/status）*/}
                {/*</div>*/}
            </div>
        </div>
    );
}
