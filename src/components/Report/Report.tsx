'use client'
import React, {useEffect, useState} from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, {SelectionPayload} from "@/components/select/selectEnterprise";
import SuggestionPieChart from "@/components/Report/ReportAggridchart";
import Aggridline from "@/components/aggridline";
import axios from "axios";
import {toast} from "react-hot-toast";

const api = axios.create({
    baseURL: '/proxy',
});

interface CompletionRateCard {
    kpiFieldId: number;
    kpiFieldName: string;
    completionRate: number;
}

export default function Report(){
    const [cards, setCards] = useState<CompletionRateCard[]>([]);
    const [selection, setSelection] = useState<SelectionPayload>({
        orgId: '',
        startYear: '',
        endYear: ''
    });
    const [orgName, setOrgName] = useState<string>("所有公司");

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "報表" }
    ];

    const fetchRates = async () => {
        try {
            const response = await api.get("/Report/GetCompletionRates", {
                params: selection.orgId ? { organizationId: selection.orgId } : {}
            });
            if (response.data?.success) {
                setCards(response.data.data);
            } else {
                toast.error("無法取得完成率資料");
            }
        } catch (error) {
            console.error("錯誤發生:", error);
            toast.error("查詢失敗");
        }
    };

    useEffect(() => {
        fetchRates();
    }, [selection.orgId]);

    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        報表
                    </h1>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <SelectEnterprise
                                onSelectionChange={(s) => {
                                    setSelection(s);
                                    setOrgName(s.orgName || "所有公司");
                                }}
                            />
                        </div>
                    </div>
                    <div className="w-4/5 mx-auto mb-6">
                        <div className="card bg-base-100 shadow-xl p-6">
                            <h2 className="text-xl font-bold text-center mb-4">各類型改善完成率（{orgName}）</h2>
                            {cards.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">目前無資料</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    {cards.map((card) => (
                                        <div key={card.kpiFieldId} className="card bg-gray-50 shadow p-4">
                                            <h3 className="text-lg font-semibold">{card.kpiFieldName} 改善完成率</h3>
                                            <p className="text-xl font-bold text-primary">{card.completionRate}%</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 w-full">
                        <div className="card bg-base-100 shadow-xl p-6 h-[550px] w-full lg:w-1/3">
                            <SuggestionPieChart
                                organizationId={selection.orgId}
                                organizationName={orgName}
                            />
                        </div>
                        <div className="card bg-base-100 shadow-xl p-6 h-[550px] w-full lg:w-2/3">
                            <Aggridline/>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
