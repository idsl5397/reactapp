import React, {useCallback, useEffect, useMemo, useState} from "react";
import api from "@/services/apiService";
import {Edit3, Plus, RefreshCw, Search, Trash2} from "lucide-react";
import {getAccessToken} from "@/services/serverAuthService";

async function authHeaders() {
    const token = await getAccessToken();
    return {
        headers: {
            Authorization: token ? `Bearer ${token.value}` : "",
        },
    };
}

type OrgRow = {
    id: number;
    name: string;
    typeCode: string;
    isActive: boolean;
    code?: string | null;
    address?: string | null;
    contactPerson?: string | null;
    contactPhone?: string | null;
    taxId?: string | null;
    parentId?: number | null; // 攤平時補上
    depth?: number;           // UI 縮排
    children?: OrgRow[];
};

type OrgUpsert = {
    name: string;
    typeId: number;
    parentId?: number | null;
    code?: string | null;
    address?: string | null;
    contactPerson?: string | null;
    contactPhone?: string | null;
    taxId?: string | null;
    isActive?: boolean;
    useParentDomainVerification?: boolean;
};

export default function OrganizationRegistryView() {
    const [tree, setTree] = useState<OrgRow[]>([]);
    const [rows, setRows] = useState<OrgRow[]>([]);
    const [loading, setLoading] = useState(false);

    // 查詢 / 篩選 / 分頁
    const [q, setQ] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [onlyActive, setOnlyActive] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 15;

    // modal
    const [editing, setEditing] = useState<OrgRow | null>(null);
    const [showModal, setShowModal] = useState(false);

    const loadTree = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<OrgRow[]>("/Admin/org/tree", await authHeaders());
            setTree(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadTree(); }, [loadTree]);

    // 攤平樹狀資料
    const flat = useMemo(() => {
        const acc: OrgRow[] = [];
        const walk = (nodes: OrgRow[], parentId: number | null, depth: number) => {
            nodes.forEach(n => {
                const self: OrgRow = { ...n, parentId, depth };
                acc.push(self);
                if (n.children?.length) walk(n.children, n.id, depth + 1);
            });
        };
        walk(tree, null, 0);
        return acc;
    }, [tree]);

    // 套用搜尋與篩選
    const filtered = useMemo(() => {
        return flat.filter(n => {
            const hitQ = !q || `${n.name} ${n.code ?? ""}`.toLowerCase().includes(q.toLowerCase());
            const hitType = !typeFilter || n.typeCode === typeFilter;
            const hitActive = !onlyActive || n.isActive;
            return hitQ && hitType && hitActive;
        });
    }, [flat, q, typeFilter, onlyActive]);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
    const pageRows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);

    // 刪除
    const onDelete = async (row: OrgRow) => {
        if (!confirm(`確定刪除「${row.name}」？`)) return;
        await api.delete(`/Admin/org/${row.id}`);
        await loadTree();
    };

    // 開 modal（新增 / 編輯）
    const openCreate = () => { setEditing(null); setShowModal(true); };
    const openEdit = (r: OrgRow) => { setEditing(r); setShowModal(true); };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">企業/公司/工廠維護</h3>
                <div className="flex gap-2">
                    <button onClick={loadTree} className="px-3 py-2 border rounded-lg flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> 重新整理
                    </button>
                    <button onClick={openCreate} className="px-3 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" /> 新增
                    </button>
                </div>
            </div>

            {/* 篩選列 */}
            <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="搜尋名稱 / 代碼"
                        className="w-full pl-9 pr-3 py-2 border rounded-lg"
                    />
                </div>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
                    <option value="">全部類型</option>
                    <option value="enterprise">企業</option>
                    <option value="company">公司</option>
                    <option value="plant">工廠</option>
                </select>
                <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
                    只顯示啟用
                </label>
            </div>

            {/* 表格 */}
            <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left">名稱</th>
                        <th className="px-4 py-2 text-left">類型</th>
                        <th className="px-4 py-2 text-left">代碼</th>
                        <th className="px-4 py-2 text-left">聯絡人</th>
                        <th className="px-4 py-2 text-left">電話</th>
                        <th className="px-4 py-2 text-left">狀態</th>
                        <th className="px-4 py-2 text-center">操作</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {pageRows.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                                <span className="text-gray-400">{Array(r.depth ?? 0).fill("—").join("")}</span>
                                <span className="ml-1">{r.name}</span>
                            </td>
                            <td className="px-4 py-2">{translateType(r.typeCode)}</td>
                            <td className="px-4 py-2">{r.code ?? "-"}</td>
                            <td className="px-4 py-2">{r.contactPerson ?? "-"}</td>
                            <td className="px-4 py-2">{r.contactPhone ?? "-"}</td>
                            <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${r.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600"}`}>
                    {r.isActive ? "啟用" : "停用"}
                  </span>
                            </td>
                            <td className="px-4 py-2">
                                <div className="flex items-center justify-center gap-2">
                                    <button className="text-blue-600 hover:text-blue-700" onClick={() => openEdit(r)}><Edit3 size={18} /></button>
                                    <button className="text-red-600 hover:text-red-700" onClick={() => onDelete(r)}><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {pageRows.length === 0 && !loading && (
                        <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={7}>查無資料</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* 分頁 */}
            <div className="flex items-center justify-between text-sm">
                <div>共 {total} 筆，頁 {page} / {totalPages}</div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>上一頁</button>
                    <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>下一頁</button>
                </div>
            </div>

            {/* Upsert Modal */}
            {showModal && (
                <OrgUpsertModal
                    initial={editing ? {
                        name: editing.name,
                        typeId: typeCodeToTypeId(editing.typeCode), // 你可替換成後端給的 type 下拉
                        parentId: editing.parentId ?? null,
                        code: editing.code ?? "",
                        address: editing.address ?? "",
                        contactPerson: editing.contactPerson ?? "",
                        contactPhone: editing.contactPhone ?? "",
                        taxId: editing.taxId ?? "",
                        isActive: editing.isActive,
                        useParentDomainVerification: false,
                    } : { name: "", typeId: 0, parentId: null, isActive: true }}
                    onClose={() => setShowModal(false)}
                    onSubmit={async (payload) => {
                        if (editing) {
                            await api.put(`/Admin/org/${editing.id}`, payload,
                                await authHeaders());
                        } else {
                            await api.post(`/Admin/org`, payload,
                                await authHeaders());
                        }
                        setShowModal(false);
                        await loadTree();
                    }}
                />
            )}
        </div>
    );
}

// 簡易 Upsert Modal（可之後換成 shadcn/ui Dialog）
function OrgUpsertModal({
                            initial,
                            onClose,
                            onSubmit,
                        }: {
    initial: Partial<OrgUpsert>;
    onClose: () => void;
    onSubmit: (payload: OrgUpsert) => Promise<void>;
}) {
    const [form, setForm] = useState<OrgUpsert>({
        name: initial.name ?? "",
        typeId: initial.typeId ?? 0,
        parentId: initial.parentId ?? null,
        code: initial.code ?? "",
        address: initial.address ?? "",
        contactPerson: initial.contactPerson ?? "",
        contactPhone: initial.contactPhone ?? "",
        taxId: initial.taxId ?? "",
        isActive: initial.isActive ?? true,
        useParentDomainVerification: initial.useParentDomainVerification ?? false,
    });
    const [saving, setSaving] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow p-6 space-y-3">
                <h4 className="text-lg font-semibold">組織資料</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <L label="名稱"><I v={form.name} onC={(v)=>setForm({...form,name:v})} /></L>
                    <L label="類型 (typeId)">
                        <input type="number" value={form.typeId} onChange={e=>setForm({...form, typeId:Number(e.target.value)})}
                               className="w-full px-3 py-2 border rounded"/>
                    </L>
                    <L label="上層 ParentId">
                        <input type="number" value={form.parentId ?? ""} onChange={e=>setForm({...form, parentId: e.target.value===""? null:Number(e.target.value)})}
                               className="w-full px-3 py-2 border rounded"/>
                    </L>
                    <L label="代碼"><I v={form.code ?? ""} onC={(v)=>setForm({...form,code:v})}/></L>
                    <L label="地址"><I v={form.address ?? ""} onC={(v)=>setForm({...form,address:v})}/></L>
                    <L label="聯絡人"><I v={form.contactPerson ?? ""} onC={(v)=>setForm({...form,contactPerson:v})}/></L>
                    <L label="電話"><I v={form.contactPhone ?? ""} onC={(v)=>setForm({...form,contactPhone:v})}/></L>
                    <L label="統編"><I v={form.taxId ?? ""} onC={(v)=>setForm({...form,taxId:v})}/></L>
                    <L label="啟用">
                        <input type="checkbox" checked={!!form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/>
                    </L>
                    <L label="沿用父層域名驗證">
                        <input type="checkbox" checked={!!form.useParentDomainVerification} onChange={e=>setForm({...form,useParentDomainVerification:e.target.checked})}/>
                    </L>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button className="px-3 py-2 border rounded" onClick={onClose}>取消</button>
                    <button
                        className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
                        disabled={saving || !form.name || !form.typeId}
                        onClick={async ()=>{
                            setSaving(true);
                            try { await onSubmit(form); } finally { setSaving(false); }
                        }}
                    >
                        儲存
                    </button>
                </div>
            </div>
        </div>
    );
}

function L({label,children}:{label:string;children:React.ReactNode}) {
    return <label className="space-y-1"><div className="text-gray-500">{label}</div>{children}</label>
}
function I({v,onC}:{v:string;onC:(v:string)=>void}) {
    return <input value={v} onChange={e=>onC(e.target.value)} className="w-full px-3 py-2 border rounded"/>
}

function typeCodeToTypeId(code:string){ return code==="enterprise"?1:code==="company"?2:code==="plant"?3:0;}

function translateType(typeCode: string) {
    if (typeCode === "enterprise") return "企業";
    if (typeCode === "company") return "公司";
    if (typeCode === "plant") return "工廠";
    return typeCode;
}