"use client";
import React from "react";
import api from "@/services/apiService";
import { toast } from "react-hot-toast";
import { getAccessToken } from "@/services/serverAuthService";
import { useCan } from "@/hooks/useCan";

type ReportRow = {
    id: number;
    kpiDataId: number;
    organizationId: number | null;
    organizationName: string | null;
    indicatorNumber: string | null;
    indicatorName: string | null;
    detailItemName: string | null;
    field: string | null;
    year: number;
    period: string;
    value: number | null;
    isSkipped: boolean;
    remarks: string | null;
    status: string;
    createdAt: string | null;
    updateAt: string | null;
};

const STATUS_TABS = [
    { label: "全部", value: undefined },
    { label: "待審核", value: 1 },
    { label: "已核准", value: 4 },
    { label: "已退回", value: 3 },
] as const;

const STATUS_LABEL: Record<string, string> = {
    Draft: "草稿",
    Submitted: "待審核",
    Reviewed: "已審閱",
    Returned: "已退回",
    Finalized: "已核准",
};

const STATUS_BADGE: Record<string, string> = {
    Draft: "badge badge-ghost",
    Submitted: "badge badge-warning",
    Reviewed: "badge badge-info",
    Returned: "badge badge-error",
    Finalized: "badge badge-success",
};

export default function StatisticsReviewView() {
    const { can } = useCan();
    const canApprove = can("kpi-approve");

    const [rows, setRows] = React.useState<ReportRow[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<number | undefined>(1);
    const [filterYear, setFilterYear] = React.useState<string>("");
    const [filterPeriod, setFilterPeriod] = React.useState<string>("");
    const [filterOrgName, setFilterOrgName] = React.useState<string>("");
    const [filterField, setFilterField] = React.useState<string>("");
    const [processingId, setProcessingId] = React.useState<number | null>(null);
    const [batchProcessing, setBatchProcessing] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

    const authHeaders = React.useCallback(async () => {
        const t = await getAccessToken();
        return { headers: { Authorization: t ? `Bearer ${t.value}` : "" } };
    }, []);

    const load = React.useCallback(async () => {
        setLoading(true);
        setSelectedIds(new Set());
        try {
            const params: Record<string, string | number> = {};
            if (activeTab !== undefined) params.status = activeTab;
            if (filterYear) params.year = Number(filterYear);
            if (filterPeriod) params.period = filterPeriod;

            const { data } = await api.get<{ success: boolean; data: ReportRow[] }>(
                "/Admin/kpi/reports",
                { ...(await authHeaders()), params }
            );
            setRows(data.data ?? []);
        } catch {
            toast.error("載入失敗");
        } finally {
            setLoading(false);
        }
    }, [activeTab, filterYear, filterPeriod, authHeaders]);

    React.useEffect(() => {
        load();
    }, [load]);

    // 依公司名稱與領域做客戶端篩選
    const displayedRows = React.useMemo(() => {
        return rows.filter((r) => {
            const matchOrg = !filterOrgName || (r.organizationName ?? "").includes(filterOrgName);
            const matchField = !filterField || (r.field ?? "").includes(filterField);
            return matchOrg && matchField;
        });
    }, [rows, filterOrgName, filterField]);

    // 目前顯示中且狀態為 Submitted 的 id（才能被批量選取）
    const submittedDisplayedIds = React.useMemo(
        () => displayedRows.filter((r) => r.status === "Submitted").map((r) => r.id),
        [displayedRows]
    );

    const allSelected =
        submittedDisplayedIds.length > 0 &&
        submittedDisplayedIds.every((id) => selectedIds.has(id));

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                submittedDisplayedIds.forEach((id) => next.delete(id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                submittedDisplayedIds.forEach((id) => next.add(id));
                return next;
            });
        }
    };

    const toggleRow = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const changeStatus = async (id: number, newStatus: number, label: string) => {
        setProcessingId(id);
        try {
            await api.patch(
                `/Admin/kpi/reports/${id}/status`,
                { newStatus },
                await authHeaders()
            );
            toast.success(`已${label}`);
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail ?? `操作失敗`);
        } finally {
            setProcessingId(null);
        }
    };

    const batchChangeStatus = async (newStatus: number, label: string) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        setBatchProcessing(true);
        try {
            await api.post(
                "/Admin/kpi/reports/batch-status",
                { ids, newStatus },
                await authHeaders()
            );
            toast.success(`已批量${label} ${ids.length} 筆`);
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "批量操作失敗");
        } finally {
            setBatchProcessing(false);
        }
    };

    const selectedCount = selectedIds.size;

    return (
        <div className="bg-white border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">達標統計與審核</h3>

            {/* Tab 切換 */}
            <div role="tablist" className="tabs tabs-boxed w-fit">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={String(tab.value)}
                        role="tab"
                        className={`tab ${activeTab === tab.value ? "tab-active" : ""}`}
                        onClick={() => setActiveTab(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 篩選列 */}
            <div className="flex flex-wrap gap-3 items-end">
                <div>
                    <label className="label label-text text-xs">年度</label>
                    <input
                        type="number"
                        placeholder="例：114"
                        className="input input-bordered input-sm w-28"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                    />
                </div>
                <div>
                    <label className="label label-text text-xs">季度</label>
                    <select
                        className="select select-bordered select-sm w-28"
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value)}
                    >
                        <option value="">全部</option>
                        {["Q1", "Q2", "Q3", "Q4", "H1", "Y"].map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label label-text text-xs">公司名稱</label>
                    <input
                        type="text"
                        placeholder="關鍵字篩選"
                        className="input input-bordered input-sm w-36"
                        value={filterOrgName}
                        onChange={(e) => setFilterOrgName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="label label-text text-xs">領域</label>
                    <input
                        type="text"
                        placeholder="關鍵字篩選"
                        className="input input-bordered input-sm w-28"
                        value={filterField}
                        onChange={(e) => setFilterField(e.target.value)}
                    />
                </div>
                <button className="btn btn-sm btn-primary" onClick={load}>
                    查詢
                </button>
            </div>

            {/* 批量操作列（有選取時才顯示） */}
            {canApprove && selectedCount > 0 && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                    <span className="text-sm text-blue-700 font-medium">
                        已選取 {selectedCount} 筆
                    </span>
                    <button
                        className="btn btn-xs btn-success"
                        disabled={batchProcessing}
                        onClick={() => batchChangeStatus(4, "核准")}
                    >
                        批量核准
                    </button>
                    <button
                        className="btn btn-xs btn-error"
                        disabled={batchProcessing}
                        onClick={() => batchChangeStatus(3, "退回")}
                    >
                        批量退回
                    </button>
                    <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => setSelectedIds(new Set())}
                    >
                        取消選取
                    </button>
                </div>
            )}

            {/* 表格 */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="py-10 text-center text-gray-400">載入中…</div>
                ) : displayedRows.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">無資料</div>
                ) : (
                    <table className="table table-sm w-full">
                        <thead>
                        <tr>
                            {canApprove && (
                                <th className="w-8">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        title="全選待審核項目"
                                        disabled={submittedDisplayedIds.length === 0}
                                    />
                                </th>
                            )}
                            <th>組織</th>
                            <th>領域</th>
                            <th>指標編號</th>
                            <th>指標名稱</th>
                            <th>細項名稱</th>
                            <th>年度</th>
                            <th>季度</th>
                            <th>填報值</th>
                            <th>備註</th>
                            <th>狀態</th>
                            <th>送出時間</th>
                            {canApprove && <th>操作</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {displayedRows.map((row) => (
                            <tr key={row.id} className="hover">
                                {canApprove && (
                                    <td>
                                        {row.status === "Submitted" && (
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={selectedIds.has(row.id)}
                                                onChange={() => toggleRow(row.id)}
                                            />
                                        )}
                                    </td>
                                )}
                                <td className="whitespace-nowrap">{row.organizationName ?? "—"}</td>
                                <td className="whitespace-nowrap">{row.field ?? "—"}</td>
                                <td>{row.indicatorNumber ?? "—"}</td>
                                <td className="max-w-[160px] truncate" title={row.indicatorName ?? ""}>
                                    {row.indicatorName ?? "—"}
                                </td>
                                <td className="max-w-[120px] truncate" title={row.detailItemName ?? ""}>
                                    {row.detailItemName ?? "—"}
                                </td>
                                <td>{row.year}</td>
                                <td>{row.period}</td>
                                <td>
                                    {row.isSkipped ? (
                                        <span className="text-gray-400 text-xs">不適用</span>
                                    ) : (
                                        row.value ?? "—"
                                    )}
                                </td>
                                <td className="max-w-[120px] truncate text-xs text-gray-500" title={row.remarks ?? ""}>
                                    {row.remarks ?? "—"}
                                </td>
                                <td>
                                    <span className={STATUS_BADGE[row.status] ?? "badge"}>
                                        {STATUS_LABEL[row.status] ?? row.status}
                                    </span>
                                </td>
                                <td className="text-xs whitespace-nowrap text-gray-500">
                                    {row.updateAt
                                        ? new Date(row.updateAt).toLocaleString("zh-TW", { hour12: false })
                                        : "—"}
                                </td>
                                {canApprove && (
                                    <td>
                                        {row.status === "Submitted" && (
                                            <div className="flex gap-1">
                                                <button
                                                    className="btn btn-xs btn-success"
                                                    disabled={processingId === row.id}
                                                    onClick={() => changeStatus(row.id, 4, "核准")}
                                                >
                                                    核准
                                                </button>
                                                <button
                                                    className="btn btn-xs btn-error"
                                                    disabled={processingId === row.id}
                                                    onClick={() => changeStatus(row.id, 3, "退回")}
                                                >
                                                    退回
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
