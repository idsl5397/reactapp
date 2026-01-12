'use client'

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Settings,
    Users,
    Target,
    MessageSquare,
    Upload,
    Download,
    BarChart3,
    Eye,
    Edit,
    Trash2,
    Plus,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight,
    Home, Edit3, RefreshCw, Landmark, Building2, Factory, Squirrel, Network, AlertCircle, Info, ChevronDown,
} from "lucide-react";
import api from "@/services/apiService";
import { ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import {getAccessToken} from "@/services/serverAuthService";
import {toast} from "react-hot-toast";


import UserManagementView from '@/components/Admin/System/UserManagementView'
import PermissionManagementView from '@/components/Admin/System/PermissionManagementView'
import DataChangeLogView from '@/components/Admin/System/DataChangeLogView'
import OrganizationStructure from '@/components/Admin/Organization/OrganizationStructure'
import OrganizationRegistryView from '@/components/Admin/Organization/OrganizationRegistryView'
import OrganizationTypesRulesView from '@/components/Admin/Organization/OrganizationTypesRulesView'
import FieldsView from '@/components/Admin/Kpi/FieldsView'
import KpiCyclesView from "@/components/Admin/Kpi/KpiCyclesView";
import ItemsListView from '@/components/Admin/Kpi/ItemsListView'
import ItemEditor from "@/components/Admin/Kpi/ItemEditor";
import CategoriesView from "@/components/Admin/Kpi/CategoriesView";
import StructureView from "@/components/Admin/Kpi/StructureView";
import ImportExportView from "@/components/Admin/Kpi/ImportExportView";
import StatisticsReviewView from "@/components/Admin/Kpi/StatisticsReviewView";

// v33 之後 row model 也要註冊
ModuleRegistry.registerModules([ClientSideRowModelModule]);
/**
 * Admin Dashboard (preview-ready)
 * - TailwindCSS utility classes
 * - No external state mgmt; pure React hooks
 * - All JSX elements properly closed (fixes S17008)
 */

export default function AdminDashboard() {
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [activeModule, setActiveModule] = useState<
        "dashboard" | "system" | "organization" | "kpi" | "suggestion"
    >("dashboard");
    const [activeSubMenu, setActiveSubMenu] = useState<string>("");

    // ---- mock stats ----
    const stats = useMemo(
        () => ({
            totalUsers: 156,
            pendingApprovals: 8,
            totalKPIs: 342,
            totalSuggestions: 89,
            unreadSuggestions: 12,
        }),
        []
    );

    const modules = useMemo(
        () => [
            {
                id: "dashboard",
                name: "儀表板",
                icon: Home,
                submenus: [],
            },
            {
                id: "system",
                name: "系統管理",
                icon: Settings,
                submenus: [
                    { id: "permissions", name: "權限管理" },
                    { id: "users", name: "使用者與角色管理" },
                    { id: "approval", name: "審核機制" },
                    { id: "logs", name: "日誌紀錄" },
                ],
            },
            {
                id: "organization",
                name: "組織管理",
                icon: Users,
                submenus: [
                    { id: "structure", name: "組織結構與階層" },   // Tree + DragDrop + Path
                    { id: "registry",  name: "企業/公司/工廠維護" }, // List + CRUD + 篩選
                    { id: "types",     name: "類型與階層規則" },     // Type + Hierarchy Rules
                ],
            },
            {
                id: "kpi",
                name: "KPI 管理",
                icon: Target,
                submenus: [
                    { id: "file", name: "指標領域維護" },
                    { id: "cycle", name: "週期管理" },
                    { id: "item", name: "指標項目" },
                    { id: "category", name: "指標類別維護" },
                    { id: "structure", name: "指標結構管理" },
                    { id: "import", name: "匯入匯出工具" },
                    { id: "statistics", name: "達標統計與審核" },
                ],
            },
            {
                id: "suggestion",
                name: "委員建議管理",
                icon: MessageSquare,
                submenus: [
                    { id: "main", name: "建議主檔維護" },
                    { id: "detail", name: "建議子項維護" },
                    { id: "analysis", name: "統計分析" },
                    { id: "batch", name: "批次匯入/匯出" },
                    { id: "reply", name: "回覆管理" },
                ],
            },
        ],
        []
    );

    const onPickModule = (
        id: "dashboard" | "system" | "organization" | "kpi" | "suggestion",
        firstSub?: string
    ) => {
        setActiveModule(id);
        setActiveSubMenu(firstSub ?? "");
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Bar */}

            <div className="mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                {/* Sidebar */}
                <aside className="bg-white rounded-xl shadow-sm border p-3">
                    <nav className="space-y-1">
                        {modules.map((m) => (
                            <div key={m.id}>
                                <button
                                    onClick={() => onPickModule(m.id as any, m.submenus?.[0]?.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition ${
                                        activeModule === m.id ? "bg-gray-100" : ""
                                    }`}
                                >
                                    <m.icon className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm text-gray-800">{m.name}</span>
                                </button>
                                {m.submenus?.length > 0 && activeModule === m.id && (
                                    <div className="pl-8 py-1 space-y-1">
                                        {m.submenus.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setActiveSubMenu(s.id)}
                                                className={`w-full text-left px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 ${
                                                    activeSubMenu === s.id
                                                        ? "bg-indigo-50 text-indigo-700"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="space-y-4">
                    <Breadcrumbs module={activeModule} subMenu={activeSubMenu} />

                    {activeModule === "dashboard" && <DashboardView stats={stats} />}

                    {activeModule === "system" && (
                        <div>
                            {activeSubMenu === "permissions" ? (
                                    <PermissionManagementView />)
                                : activeSubMenu === "users" ? (
                                    <UserManagementView />)
                                : activeSubMenu === "approval" ? (
                                        <Placeholder title="審核機制(未開發)" desc="建立帳號申請/權限變更審核流與批次核准。" />)
                                    : activeSubMenu === "logs" ? (
                                            <DataChangeLogView />)
                                        : (
                                            <SectionHint text="請在左側選擇子功能" />
                                        )}
                        </div>
                    )}

                    {activeModule === "organization" && (
                        <div>
                            {activeSubMenu === "structure" ? (
                                // 先用內建 mock；等你後端 API 好了，傳入 fetchTree 即可
                                <OrganizationStructure
                                    // 範例：之後你只要打開以下註解就能接後端
                                    // fetchTree={async () => {
                                    //   const { data } = await api.get<OrgTreeNode[]>("/org/tree", await authHeaders());
                                    //   return data;
                                    // }}
                                />
                            ) : activeSubMenu === "registry" ? (
                                <OrganizationRegistryView />
                            ) : activeSubMenu === "types" ? (
                                <OrganizationTypesRulesView />
                            ) : (
                                <SectionHint text="請在左側選擇子功能" />
                            )}
                        </div>
                    )}

                    {activeModule === "kpi" && (
                        <>
                            {activeSubMenu === "file" && <FieldsView />}
                            {activeSubMenu === "cycle" && <KpiCyclesView />}
                            {activeSubMenu === "item" && <ItemsListView
                                onSelect={(id)=>setSelectedItemId(id)}
                                onCreate={(id)=>setSelectedItemId(id)}
                            />}
                            {activeSubMenu === "category" && <CategoriesView />}
                            {activeSubMenu === "structure" && <StructureView />}
                            {activeSubMenu === "import" && <ImportExportView />}
                            {activeSubMenu === "statistics" && <StatisticsReviewView />}
                            {!activeSubMenu && <div className="text-gray-500">請在左側選擇子功能</div>}
                        </>
                    )}

                    {activeModule === "suggestion" && (
                        <div>
                            <SuggestionManagementView />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// ---------------- UI Fragments ----------------

function SectionHint({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center h-40 bg-white border rounded-xl text-gray-500">
            {text}
        </div>
    );
}

function Breadcrumbs({
                         module,
                         subMenu,
                     }: {
    module: string;
    subMenu: string;
}) {
    const map: Record<string, string> = {
        dashboard: "儀表板",
        system: "系統管理",
        organization: "組織管理",
        kpi: "KPI 管理",
        suggestion: "委員建議管理",
    };
    return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <Home className="h-4 w-4" />
            <span className="hover:text-gray-700">首頁</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-700 font-medium">{map[module] ?? ""}</span>
            {subMenu && (
                <>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-500">{subMenu}</span>
                </>
            )}
        </div>
    );
}

// ---------- Dashboard ----------
function DashboardView({
                           stats,
                       }: {
    stats: {
        totalUsers: number;
        pendingApprovals: number;
        totalKPIs: number;
        totalSuggestions: number;
        unreadSuggestions: number;
    };
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">儀表板總覽</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="使用者總數" value={stats.totalUsers} icon={<Users className="text-blue-500" size={40} />} />
                <StatCard title="待審核項目" value={stats.pendingApprovals} icon={<Clock className="text-orange-500" size={40} />} valueClass="text-orange-500" />
                <StatCard title="KPI 指標總數" value={stats.totalKPIs} icon={<Target className="text-green-500" size={40} />} valueClass="text-green-500" />
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">委員建議</p>
                            <p className="text-3xl font-bold text-purple-500 mt-2">{stats.totalSuggestions}</p>
                            <p className="text-xs text-red-500 mt-1">未讀 {stats.unreadSuggestions} 筆</p>
                        </div>
                        <MessageSquare className="text-purple-500" size={40} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">近期待處理事項</h3>
                    <div className="space-y-3">
                        <TodoRow color="orange" title="新使用者註冊審核" subtitle="3 筆待審核" />
                        <TodoRow color="blue" title="KPI 資料上傳" subtitle="5 筆待確認" />
                        <TodoRow color="purple" title="委員建議回覆" subtitle="12 筆待回覆" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">系統使用統計</h3>
                    <UsageBar label="政府端用戶" value={45} percent={29} />
                    <UsageBar label="公司端用戶" value={98} percent={63} />
                    <UsageBar label="委員" value={13} percent={8} />
                </div>
            </div>
        </div>
    );
}

function StatCard({
                      title,
                      value,
                      icon,
                      valueClass,
                  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    valueClass?: string;
}) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${valueClass ?? "text-gray-800"}`}>{value}</p>
                </div>
                {icon}
            </div>
        </div>
    );
}

function TodoRow({
                     color,
                     title,
                     subtitle,
                 }: {
    color: "orange" | "blue" | "purple";
    title: string;
    subtitle: string;
}) {
    const colorMap: Record<string, string> = {
        orange: "bg-orange-50 text-orange-500 hover:text-orange-600",
        blue: "bg-blue-50 text-blue-500 hover:text-blue-600",
        purple: "bg-purple-50 text-purple-500 hover:text-purple-600",
    };
    return (
        <div className={`flex items-center justify-between p-3 rounded ${colorMap[color]}`}>
            <div>
                <p className="font-medium text-gray-800">{title}</p>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
            <button className="transition">
                <ChevronRight size={20} />
            </button>
        </div>
    );
}

function UsageBar({ label, value, percent }: { label: string; value: number; percent: number }) {
    return (
        <div className="space-y-2 mb-4">
            <div className="flex justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-medium">{value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

// ---------- KPI Management ----------
function KPIManagementView() {
    const kpis = [
        { code: "PSM-001", name: "永續報告書發行率", category: "PSM", year: "2025/Q3", target: "100%", actual: "98%", status: "achieved" },
        { code: "EP-023", name: "碳排放減量比例", category: "EP", year: "2025/Q3", target: "15%", actual: "12%", status: "not-achieved" },
        { code: "FR-045", name: "供應商稽核完成率", category: "FR", year: "2025/Q3", target: "90%", actual: "95%", status: "achieved" },
        { code: "ECO-012", name: "綠色採購金額比例", category: "ECO", year: "2025/Q3", target: "20%", actual: "22%", status: "achieved" },
    ] as const;

    const catClass = (c: string) =>
        c === "PSM"
            ? "bg-blue-100 text-blue-700"
            : c === "EP"
                ? "bg-green-100 text-green-700"
                : c === "FR"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-orange-100 text-orange-700";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">KPI 指標管理</h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        <Download size={20} />
                        下載範本
                    </button>
                    <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        <Upload size={20} />
                        匯入資料
                    </button>
                    <button className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
                        <Plus size={20} />
                        新增指標
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard label="基礎型指標" value={156} valueClass="text-blue-600" />
                <SummaryCard label="客製型指標" value={186} valueClass="text-green-600" />
                <SummaryCard label="已達標" value={298} valueClass="text-green-600" />
                <SummaryCard label="未達標" value={44} valueClass="text-red-600" />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex gap-4 mb-6">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>全部類別</option>
                        <option>PSM - 永續管理</option>
                        <option>EP - 環境保護</option>
                        <option>FR - 公平責任</option>
                        <option>ECO - 經濟發展</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>2025年度</option>
                        <option>2024年度</option>
                        <option>2023年度</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>全部季度</option>
                        <option>Q1</option>
                        <option>Q2</option>
                        <option>Q3</option>
                        <option>Q4</option>
                    </select>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="搜尋指標名稱或代碼..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">指標代碼</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">指標名稱</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">類別</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">年度/季度</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">目標值</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">實際值</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">達標狀態</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">操作</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {kpis.map((kpi, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{kpi.code}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{kpi.name}</td>
                                <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${catClass(kpi.category)}`}>
                      {kpi.category}
                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{kpi.year}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{kpi.target}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{kpi.actual}</td>
                                <td className="px-4 py-3 text-sm">
                                    {kpi.status === "achieved" ? (
                                        <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={16} /> 達標
                      </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600">
                        <XCircle size={16} /> 未達標
                      </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button className="text-blue-500 hover:text-blue-600" aria-label="檢視">
                                            <Eye size={18} />
                                        </button>
                                        <button className="text-green-500 hover:text-green-600" aria-label="編輯">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-red-500 hover:text-red-600" aria-label="刪除">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, valueClass }: { label: string; value: number; valueClass?: string }) {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className={`text-2xl font-bold mt-2 ${valueClass ?? "text-gray-800"}`}>{value}</p>
        </div>
    );
}

// ---------- Suggestion Management ----------
function SuggestionManagementView() {
    const rows = [
        { date: "2025-10-15", meeting: "第三次審查會議", committee: "陳委員", content: "建議強化碳排放監測頻率...", org: "ABC公司", status: "adopted", deadline: "2025-12-31" },
        { date: "2025-10-10", meeting: "第三次審查會議", committee: "林委員", content: "供應商管理制度需更完善...", org: "XYZ企業", status: "evaluating", deadline: "2025-11-30" },
        { date: "2025-09-28", meeting: "第二次審查會議", committee: "黃委員", content: "永續報告書揭露項目建議增加...", org: "DEF集團", status: "adopted", deadline: "2026-03-31" },
        { date: "2025-09-20", meeting: "第二次審查會議", committee: "陳委員", content: "員工訓練時數統計方式調整...", org: "ABC公司", status: "not-adopted", deadline: "-" },
    ] as const;

    const statusPill = (s: string) =>
        s === "adopted"
            ? "bg-green-100 text-green-700"
            : s === "evaluating"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-700";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">委員建議管理</h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        <BarChart3 size={20} />
                        統計分析
                    </button>
                    <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        <Upload size={20} />
                        批次匯入
                    </button>
                    <button className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
                        <Plus size={20} />
                        新增建議
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard label="總建議數" value={89} valueClass="text-blue-600" />
                <SummaryCard label="已採納" value={45} valueClass="text-green-600" />
                <SummaryCard label="評估中" value={32} valueClass="text-orange-600" />
                <SummaryCard label="未採納" value={12} valueClass="text-gray-600" />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex gap-4 mb-6">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>全部會議</option>
                        <option>第一次審查會議</option>
                        <option>第二次審查會議</option>
                        <option>專案審查會議</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>全部委員</option>
                        <option>陳委員</option>
                        <option>林委員</option>
                        <option>黃委員</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>全部狀態</option>
                        <option>已採納</option>
                        <option>評估中</option>
                        <option>未採納</option>
                    </select>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="搜尋建議內容..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日期</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">會議別</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">委員</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">建議內容</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">對應組織</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">採納情形</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">預計完成</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">操作</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {rows.map((r, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-600">{r.date}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{r.meeting}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{r.committee}</td>
                                <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">{r.content}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{r.org}</td>
                                <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusPill(r.status)}`}>
                      {r.status === "adopted" ? "已採納" : r.status === "evaluating" ? "評估中" : "未採納"}
                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{r.deadline}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button className="text-blue-500 hover:text-blue-600" aria-label="檢視">
                                            <Eye size={18} />
                                        </button>
                                        <button className="text-green-500 hover:text-green-600" aria-label="編輯">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-red-500 hover:text-red-600" aria-label="刪除">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="bg-white rounded-xl border shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{desc}</p>
        </div>
    );
}
