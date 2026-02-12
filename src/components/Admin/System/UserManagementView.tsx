import React from "react";
import {CheckCircle, Clock, Eye, Filter, Mail, MailX, Search, Trash2, X} from "lucide-react";
import api from "@/services/apiService";
import {getAccessToken} from "@/services/serverAuthService";

type UserDetailDto = {
    id: string;
    username: string;
    nickname?: string | null;
    email?: string | null;
    mobile?: string | null;
    unit?: string | null;
    position?: string | null;
    organizationName?: string | null;
    roles: string[];
    isActive: boolean;
    emailVerified: boolean;
    emailVerifiedAt?: string | null;
    createdAt: string;
    lastLoginAt?: string | null;
    passwordChangedAt?: string | null;
    forceChangePassword: boolean;
};

async function authHeaders() {
    const token = await getAccessToken();
    return {
        headers: {
            Authorization: token ? `Bearer ${token.value}` : "",
        },
    };
}

function useDebounce<T>(value: T, delay = 350) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

type UserListItemDto = {
    id: string;
    name: string;
    account: string;
    roles: string[];
    unit?: string | null;
    status: "active" | "pending" | "disabled";
    lastLoginAt?: string | null;
    emailVerified: boolean;
};

type PagedResult<T> = {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
};

export default function UserManagementView() {
    const [rows, setRows] = React.useState<UserListItemDto[]>([]);
    const [q, setQ] = React.useState("");
    const debouncedQ = useDebounce(q, 350);
    const [role, setRole] = React.useState("");
    const [status, setStatus] = React.useState<"" | "active" | "pending" | "disabled">("");
    const [loading, setLoading] = React.useState(false);

    const [page, setPage] = React.useState(1);
    const [pageSize] = React.useState(20);
    const [total, setTotal] = React.useState(0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // 防競態
    const reqSeqRef = React.useRef(0);
    const lastAppliedRef = React.useRef(0);

    // 記錄過濾條件，變更時把 page 校正為 1
    const lastFilterRef = React.useRef({
        q: "",
        role: "",
        status: "" as "" | "active" | "pending" | "disabled",
    });

    const roleClass = React.useCallback((r: string) =>
        r.includes("系統") ? "bg-red-100 text-red-700" :
            r.includes("政府") ? "bg-blue-100 text-blue-700" :
                r.includes("公司") ? "bg-green-100 text-green-700" :
                    "bg-purple-100 text-purple-700", []);

    const statusChip = React.useCallback((s: UserListItemDto["status"]) => {
        return s === "active" ? (
            <span className="flex items-center gap-1 text-green-600"><CheckCircle size={16} /> 啟用中</span>
        ) : s === "pending" ? (
            <span className="flex items-center gap-1 text-orange-600"><Clock size={16} /> 待審核</span>
        ) : (
            <span className="flex items-center gap-1 text-gray-500"><Clock size={16} /> 已停用</span>
        );
    }, []);

    const fmtTime = React.useCallback((iso?: string | null) => {
        if (!iso) return "-";
        const d = new Date(iso);
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }, []);

    // 單一來源的查詢
    const fetchUsers = React.useCallback(
        async (p: number, kw: string, r: string, s: "" | "active" | "pending" | "disabled") => {
            const nextSeq = ++reqSeqRef.current;
            setLoading(true);
            try {
                const params: Record<string, any> = {
                    page: Math.max(1, p),   // 後端 1-based
                    pageSize,
                };
                if (kw && kw.trim()) params.q = kw.trim();
                if (r && r.trim()) params.role = r.trim();
                if (s) params.status = s;

                const { data } = await api.get<PagedResult<UserListItemDto>>("/Admin/users", { params, ...(await authHeaders()) });
                console.log("[Fast Refresh1]: ",params)
                console.log("[Fast Refresh2]: ",data)
                if (nextSeq > lastAppliedRef.current) {
                    lastAppliedRef.current = nextSeq;
                    setRows(data.items ?? []);
                    setTotal(data.total ?? 0);
                }
            } catch (e: any) {
                console.error(e);
                if (nextSeq > lastAppliedRef.current) alert(`載入使用者失敗：${e?.message || e}`);
            } finally {
                if (nextSeq === reqSeqRef.current) setLoading(false);
            }
        },
        [pageSize]
    );

    // 依 page / 過濾條件打 API
    React.useEffect(() => {
        const prev = lastFilterRef.current;
        if (prev.q !== debouncedQ || prev.role !== role || prev.status !== status) {
            lastFilterRef.current = { q: debouncedQ, role, status };
            if (page !== 1) { setPage(1); return; }
        }
        fetchUsers(page, debouncedQ, role, status);
    }, [debouncedQ, role, status, page, fetchUsers]);

    // 操作
    const onToggleActive = React.useCallback(async (u: UserListItemDto) => {
        const isActive = u.status === "disabled";
        try {
            await api.patch(`/Admin/users/${u.id}/active`, { isActive }, { ...(await authHeaders())});
            fetchUsers(page, debouncedQ, role, status);
        } catch (e: any) {
            console.error(e);
            alert(`變更啟用狀態失敗：${e?.message || e}`);
        }
    }, [page, debouncedQ, role, status, fetchUsers]);

    const onToggleEmailVerified = React.useCallback(async (u: UserListItemDto) => {
        const newVal = !u.emailVerified;
        if (!confirm(`確定要將「${u.name}」的 Email 驗證狀態設為「${newVal ? "已驗證" : "未驗證"}」？`)) return;
        try {
            await api.patch(`/Admin/users/${u.id}/email-verified`, { emailVerified: newVal }, { ...(await authHeaders())});
            fetchUsers(page, debouncedQ, role, status);
        } catch (e: any) {
            console.error(e);
            alert(`變更 Email 驗證狀態失敗：${e?.message || e}`);
        }
    }, [page, debouncedQ, role, status, fetchUsers]);

    const [rolesList, setRolesList] = React.useState<string[]>([]);

    React.useEffect(() => {
        const fetchRoles = async () => {
            try {
                const { data } = await api.get<string[]>("/Admin/roles", await authHeaders());
                setRolesList(data);
            } catch (e: any) {
                console.error(e);
                alert("載入角色清單失敗：" + (e?.message || e));
            }
        };
        fetchRoles();
    }, []);

    const onDelete = React.useCallback(async (u: UserListItemDto) => {
        if (!confirm(`確定刪除使用者「${u.name}」？`)) return;

        try {
            await api.delete(`/Admin/users/${u.id}`, await authHeaders());

            // 先依目前 state 計算刪除後的總數與總頁數
            const newTotal = Math.max(0, total - 1);
            const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize));
            const remainInPage = rows.length - 1; // 刪掉當前這筆後，這一頁還剩幾筆

            // 樂觀更新列表與總數（立刻讓 UI 反映）
            setRows(prev => prev.filter(x => x.id !== u.id));
            setTotal(newTotal);

            // 如果刪完之後當前頁碼超出最大頁，往回一頁
            if (page > newTotalPages) {
                setPage(newTotalPages); // 交給 effect 依新頁碼重抓
            } else {
                // 否則可選擇立即重抓，避免因排序/索引造成的空缺
                fetchUsers(page, debouncedQ, role, status);
            }
        } catch (e: any) {
            console.error(e);
            alert(`刪除失敗：${e?.message || e}`);
        }
    }, [rows.length, page, total, pageSize, debouncedQ, role, status, fetchUsers]);

    // ===== 使用者詳情 Modal =====
    const [detailUser, setDetailUser] = React.useState<UserDetailDto | null>(null);
    const [detailLoading, setDetailLoading] = React.useState(false);

    const onViewDetail = React.useCallback(async (userId: string) => {
        setDetailLoading(true);
        try {
            const { data } = await api.get<UserDetailDto>(`/Admin/users/${userId}`, await authHeaders());
            setDetailUser(data);
        } catch (e: any) {
            console.error(e);
            alert(`載入使用者詳情失敗：${e?.message || e}`);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">使用者與角色管理</h2>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {/* 搜尋 + 篩選列 */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            type="text"
                            placeholder="搜尋使用者名稱、帳號或單位..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        type="text"
                        placeholder="角色名稱（可留空）"
                        className="w-full md:w-52 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">全部狀態</option>
                        <option value="active">啟用中</option>
                        <option value="pending">待審核</option>
                        <option value="disabled">已停用</option>
                    </select>
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        onClick={() => { if (page !== 1) setPage(1); else fetchUsers(1, debouncedQ, role, status); }}
                        disabled={loading}
                        title="套用篩選"
                    >
                        <Filter size={20} />
                        套用
                    </button>
                </div>

                {/* 表格 */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">使用者名稱</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">帳號</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">角色</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">單位</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">狀態</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Email 驗證</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">最後登入</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">操作</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {rows.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-800">{u.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{u.account}</td>

                                {/* 角色欄：放下拉選單在這裡 */}
                                <td className="px-4 py-3 text-sm">
                                    <select
                                        value={u.roles[0] ?? ""} // 假設一人一角色；要多角色可之後改 isMulti
                                        onChange={async (e) => {
                                            const selectedRole = e.target.value;
                                            try {
                                                await api.put(`/Admin/users/${u.id}/roles`, {
                                                    roles: selectedRole ? [selectedRole] : [],
                                                }, { ...(await authHeaders())});
                                                // 重新載入目前頁
                                                fetchUsers(page, debouncedQ, role, status);
                                            } catch (err: any) {
                                                console.error(err);
                                                alert(`設定角色失敗：${err?.message || err}`);
                                            }
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">未指派</option>
                                        {rolesList.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-600">{u.unit ?? "-"}</td>
                                <td className="px-4 py-3 text-sm">{statusChip(u.status)}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                            u.emailVerified
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-red-100 text-red-700 hover:bg-red-200"
                                        }`}
                                        title={u.emailVerified ? "點擊設為未驗證" : "點擊設為已驗證"}
                                        onClick={() => onToggleEmailVerified(u)}
                                    >
                                        {u.emailVerified ? <Mail size={14} /> : <MailX size={14} />}
                                        {u.emailVerified ? "已驗證" : "未驗證"}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{fmtTime(u.lastLoginAt)}</td>

                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            className="text-blue-500 hover:text-blue-600"
                                            aria-label="檢視"
                                            onClick={() => onViewDetail(u.id)}
                                            disabled={detailLoading}
                                        >
                                            <Eye size={18}/>
                                        </button>

                                        {/* 這裡不再放角色下拉 */}
                                        <button
                                            className={`${u.status === "disabled" ? "text-green-600 hover:text-green-700" : "text-gray-500 hover:text-gray-600"}`}
                                            aria-label={u.status === "disabled" ? "啟用" : "停用"}
                                            onClick={() => onToggleActive(u)}
                                            title={u.status === "disabled" ? "啟用" : "停用"}
                                        >
                                            {u.status === "disabled" ? <CheckCircle size={18}/> : <Clock size={18}/>}
                                        </button>

                                        <button
                                            className="text-red-500 hover:text-red-600"
                                            aria-label="刪除"
                                            onClick={() => onDelete(u)}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && !loading && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">查無資料</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 分頁 */}
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <div>共 {total} 筆，頁 {page} / {totalPages}</div>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || loading}
                        >
                            上一頁
                        </button>
                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || loading}
                        >
                            下一頁
                        </button>
                    </div>
                </div>
            </div>

            {/* 使用者詳情 Modal */}
            {detailUser && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setDetailUser(null); }}
                >
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            onClick={() => setDetailUser(null)}
                            aria-label="關閉"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-lg font-semibold mb-4">使用者詳情</h3>

                        <div className="space-y-3 text-sm">
                            <DetailRow label="帳號" value={detailUser.username} />
                            <DetailRow label="姓名" value={detailUser.nickname} />
                            <DetailRow label="Email" value={detailUser.email} />
                            <DetailRow label="手機" value={detailUser.mobile} />
                            <DetailRow label="組織" value={detailUser.organizationName} />
                            <DetailRow label="單位" value={detailUser.unit} />
                            <DetailRow label="職稱" value={detailUser.position} />
                            <DetailRow label="角色" value={detailUser.roles.length > 0 ? detailUser.roles.join(", ") : null} />
                            <DetailRow label="帳號狀態">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                    detailUser.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                    {detailUser.isActive ? "啟用中" : "停用"}
                                </span>
                            </DetailRow>
                            <DetailRow label="Email 驗證">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                    detailUser.emailVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                    {detailUser.emailVerified ? "已驗證" : "未驗證"}
                                </span>
                            </DetailRow>
                            <DetailRow label="Email 驗證時間" value={fmtTime(detailUser.emailVerifiedAt)} />
                            <DetailRow label="建立時間" value={fmtTime(detailUser.createdAt)} />
                            <DetailRow label="最後登入" value={fmtTime(detailUser.lastLoginAt)} />
                            <DetailRow label="密碼變更時間" value={fmtTime(detailUser.passwordChangedAt)} />
                            <DetailRow label="強制變更密碼">
                                <span className={`text-xs font-medium ${detailUser.forceChangePassword ? "text-red-600" : "text-gray-500"}`}>
                                    {detailUser.forceChangePassword ? "是" : "否"}
                                </span>
                            </DetailRow>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button className="btn btn-ghost text-black" onClick={() => setDetailUser(null)}>關閉</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
    return (
        <div className="flex border-b border-gray-100 pb-2">
            <span className="w-32 flex-shrink-0 font-medium text-gray-600">{label}</span>
            <span className="text-gray-800">{children ?? value ?? <span className="text-gray-400">-</span>}</span>
        </div>
    );
}