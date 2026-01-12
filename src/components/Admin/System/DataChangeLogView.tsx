import React, {useEffect, useState} from "react";
import api from "@/services/apiService";
import {RefreshCw, Search} from "lucide-react";
import {getAccessToken} from "@/services/serverAuthService";

async function authHeaders() {
    const token = await getAccessToken();
    return {
        headers: {
            Authorization: token ? `Bearer ${token.value}` : "",
        },
    };
}

interface DataChangeLog {
    id: number;
    occurredAtUtc: string;
    userId?: string;
    userName?: string;
    action: string;
    entityName: string;
    tableName?: string;
    entityId?: string;
    requestPath?: string;
    clientIp?: string;
    payloadJson?: string;
}
export default function DataChangeLogView() {
    const [logs, setLogs] = useState<DataChangeLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get<DataChangeLog[]>("/Admin/data-change-logs", {
                params: { q: keyword },
                ...(await authHeaders())
            });
            setLogs(data);
        } catch (err) {
            console.error(err);
            alert("載入日誌失敗");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">日誌紀錄</h2>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                >
                    <RefreshCw size={18} />
                    重新整理
                </button>
            </div>

            {/* 搜尋列 */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="搜尋使用者、動作或資料表..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    搜尋
                </button>
            </div>

            {/* 表格 */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left">時間</th>
                        <th className="px-4 py-3 text-left">使用者</th>
                        <th className="px-4 py-3 text-left">動作</th>
                        <th className="px-4 py-3 text-left">資料表</th>
                        <th className="px-4 py-3 text-left">記錄ID</th>
                        <th className="px-4 py-3 text-left">路徑</th>
                        <th className="px-4 py-3 text-left">IP</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {logs.length === 0 && !loading && (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                查無日誌資料
                            </td>
                        </tr>
                    )}
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                {new Date(log.occurredAtUtc).toLocaleString("zh-TW")}
                            </td>
                            <td className="px-4 py-3">{log.userName || "未知"}</td>
                            <td className="px-4 py-3">{log.action}</td>
                            <td className="px-4 py-3">{log.tableName || "-"}</td>
                            <td className="px-4 py-3">{log.entityId || "-"}</td>
                            <td className="px-4 py-3 text-gray-600">{log.requestPath}</td>
                            <td className="px-4 py-3 text-gray-500">{log.clientIp}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}