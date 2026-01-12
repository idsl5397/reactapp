"use client";
export default function ImportExportView() {
    return (
        <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">匯入匯出工具</h3>
            <p className="text-sm text-gray-500 mb-4">先提供外殼：放「下載樣板」「上傳 Excel」「檔案歷史紀錄」。等你提供實際 API 路由後接上。</p>
            <div className="flex gap-2">
                <button className="px-3 py-2 rounded border">下載樣板</button>
                <label className="px-3 py-2 rounded border bg-gray-50 cursor-pointer">
                    <input type="file" className="hidden" />
                    上傳 Excel
                </label>
                <button className="px-3 py-2 rounded border">匯出目前查詢結果</button>
            </div>
            <div className="mt-6 text-sm text-gray-600">
                ※ 建議後端提供：<br/>
                • POST /Admin/kpi/import<br/>
                • GET /Admin/kpi/export?fieldId=&category=&orgId=&q= <br/>
                • GET /Admin/kpi/import-jobs（歷史紀錄）
            </div>
        </div>
    );
}
