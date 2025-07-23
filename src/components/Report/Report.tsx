'use client';
import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, { SelectionPayload } from "@/components/select/selectEnterprise";
import SuggestionPieChart from "@/components/Report/ReportAggridchart";
import Aggridline from "@/components/aggridline";
import RankingSugAg from "@/components/Report/RankingSugAg";
import RankingKpi from "@/components/Report/RankingKpi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useauthStore } from "@/Stores/authStore";
import { getAccessToken } from "@/services/serverAuthService";
import { enterpriseService } from "@/services/selectCompany";

const api = axios.create({ baseURL: '/proxy' });

interface CompletionRateCard {
    kpiFieldId: number;
    kpiFieldName: string;
    completionRate: number;
}

export default function Report() {
    const [cards, setCards] = useState<CompletionRateCard[]>([]);
    const [selection, setSelection] = useState<SelectionPayload>({
        orgId: '',
        orgName: '',
        startYear: '',
        endYear: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const { userRole, userOrgId, permissions } = useauthStore();
    const canViewRanking = permissions.includes("view-ranking");

    // ✅ 共用拉資料邏輯
    const fetchRates = async (orgId?: string) => {
        setIsLoading(true);
        try {
            const token = await getAccessToken();
            const response = await api.get("/Report/GetCompletionRates", {
                params: orgId ? { organizationId: orgId } : {},
                headers: { Authorization: `Bearer ${token?.value}` }
            });

            if (response.data?.success) {
                setCards(response.data.data);
            } else {
                toast.error("無法取得完成率資料");
            }
        } catch (error) {
            console.error("錯誤發生:", error);
            toast.error("查詢失敗");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ 初始化時若為公司角色，鎖定自己的組織並帶入名稱
    useEffect(() => {
        const init = async () => {
            if (userRole === 'company' && userOrgId) {
                const enterprises = await enterpriseService.fetchData();
                let foundName = '';

                for (const e of enterprises) {
                    if (e.id === userOrgId) { foundName = e.name; break; }
                    for (const c of e.children || []) {
                        if (c.id === userOrgId) { foundName = c.name; break; }
                        for (const f of c.children || []) {
                            if (f.id === userOrgId) { foundName = f.name; break; }
                        }
                    }
                }

                setSelection({
                    orgId: userOrgId.toString(),
                    orgName: foundName,
                    startYear: '',
                    endYear: ''
                });
                await fetchRates(userOrgId.toString());
            }
        };

        init();
    }, [userRole, userOrgId]);

    // ✅ 使用者互動更新資料
    useEffect(() => {
        if (selection.orgId) fetchRates(selection.orgId);
        else fetchRates(); // 查全部
    }, [selection.orgId]);

    const getCompletionRateColor = (rate: number) => {
        if (rate >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (rate >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (rate >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getProgressBarColor = (rate: number) => {
        if (rate >= 90) return 'bg-emerald-500';
        if (rate >= 70) return 'bg-blue-500';
        if (rate >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "報表" }
    ];

    return (
        <>
            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Breadcrumbs items={breadcrumbItems}/>
                    <div className="mt-6">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            數據分析報表
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-4"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">

                        {/* Filter Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></div>
                                <h2 className="text-xl font-semibold text-gray-800">篩選條件</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                <SelectEnterprise
                                    onSelectionChange={(s) => {
                                        console.log("選到：", s);
                                        setSelection(s);
                                    }}
                                />
                            </div>
                        </div>

                        {/* KPI Cards Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        各類型改善完成率
                                        <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {selection.orgName || "所有公司"}
                                        </span>
                                    </h2>
                                </div>
                                {isLoading && (
                                    <div className="flex items-center text-gray-500">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                                        載入中...
                                    </div>
                                )}
                            </div>

                            {cards.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-500 mb-2">目前無資料</h3>
                                    <p className="text-sm text-gray-400">請選擇其他篩選條件或稍後再試</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {cards.map((card, index) => (
                                        <div
                                            key={card.kpiFieldId}
                                            className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg ${getCompletionRateColor(card.completionRate)}`}
                                            style={{
                                                animationDelay: `${index * 100}ms`
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                                                    </svg>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-bold">{card.completionRate}%</p>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-base mb-3 leading-tight">
                                                {card.kpiFieldName} 改善完成率
                                            </h3>
                                            <div className="w-full bg-white/30 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-1000 ${getProgressBarColor(card.completionRate)}`}
                                                    style={{width: `${card.completionRate}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center mb-4">
                                    <div className="w-2 h-6 bg-purple-500 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-semibold text-gray-800">建議分布圖</h2>
                                </div>
                                <div className="h-[450px]">
                                    <SuggestionPieChart
                                        organizationId={selection.orgId}
                                        organizationName={selection.orgName || "所有公司"}
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center mb-4">
                                    <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-semibold text-gray-800">趨勢分析</h2>
                                </div>
                                <div className="h-[450px]">
                                    <Aggridline/>
                                </div>
                            </div>
                        </div>

                        {/* Ranking Section */}
                        {canViewRanking && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-6 bg-yellow-500 rounded-full mr-3"></div>
                                        <h2 className="text-xl font-semibold text-gray-800">建議排名</h2>
                                    </div>
                                    <RankingSugAg/>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-6 bg-red-500 rounded-full mr-3"></div>
                                        <h2 className="text-xl font-semibold text-gray-800">KPI 排名</h2>
                                    </div>
                                    <RankingKpi/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}