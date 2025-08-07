'use client';

import React, { useMemo, useState, useEffect } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";
import api from "@/services/apiService";

interface KpiReportStatDto {
    field: string;
    year: number;
    period: string;
    totalCount: number;
    metCount: number;
}

interface ChartData {
    period: string;
    [field: string]: number | string;
}

interface KpiTrendLineChartProps {
    organizationId?: string;
    organizationName?: string;
}

export default function KpiTrendLineChart({ organizationId }: KpiTrendLineChartProps) {
    const [data, setData] = useState<ChartData[]>([]);
    const [startPeriod, setStartPeriod] = useState("");
    const [endPeriod, setEndPeriod] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // ⏳開始載入
            try {
                const res = await api.get<KpiReportStatDto[]>("/Report/kpi-trend", {
                    params: organizationId ? { organizationId } : {}
                });

                const raw = res.data;

                // ✨ 轉換為 period + field 對應的達成率
                const grouped: Record<string, ChartData> = {};

                raw.forEach(item => {
                    const { year, period, field, totalCount, metCount } = item;
                    const key = `${year}${period}`;
                    const percentage = totalCount > 0 ? Math.round(((totalCount-metCount) / totalCount) * 10000) / 100 : 0;

                    if (!grouped[key]) grouped[key] = { period: key };
                    grouped[key][field] = percentage;
                });

                const chartData = Object.values(grouped).sort((a, b) =>
                    String(a.period).localeCompare(String(b.period), undefined, { numeric: true })
                );

                setData(chartData);

                if (chartData.length > 0) {
                    setStartPeriod(chartData[0].period as string);
                    setEndPeriod(chartData[chartData.length - 1].period as string);
                }
            } catch (err) {
                console.error("❌ 無法取得趨勢資料", err);
            } finally {
                setIsLoading(false); // ✅ 結束載入
            }
        };

        fetchData();
    }, [organizationId]);

    const filteredData = useMemo(() => {
        const startIndex = data.findIndex(d => d.period === startPeriod);
        const endIndex = data.findIndex(d => d.period === endPeriod);
        return data.slice(startIndex, endIndex + 1);
    }, [data, startPeriod, endPeriod]);

    // 根據所有出現的欄位自動產生 series（不寫死 PSM/EP/FR）
    const allFields = useMemo(() => {
        const fieldSet = new Set<string>();
        data.forEach(d => {
            Object.keys(d).forEach(key => {
                if (key !== "period") fieldSet.add(key);
            });
        });
        return Array.from(fieldSet);
    }, [data]);

    const options: AgChartOptions = useMemo(() => ({
        data: filteredData,
        title: { text: "公司達成率趨勢圖" },
        series: allFields.map(field => ({
            type: "line",
            xKey: "period",
            yKey: field,
            yName: field,
            marker: { enabled: true }
        })),
        axes: [
            { type: "category", position: "bottom", title: { text: "時間" } },
            { type: "number", position: "left", title: { text: "達成率 (%)" }, min: 0, max: 100 }
        ],
        legend: { position: "right" }
    }), [filteredData, allFields]);

    return (
        <>
            <h2 className="sr-only">公司達成率趨勢圖表</h2>
            <div role="img" aria-label={`公司達成率趨勢圖，從 ${startPeriod} 到 ${endPeriod}`}>
                {isLoading ? (
                    // 🎨 Skeleton 畫面
                    <div className="animate-pulse space-y-4">

                        <div className="skeleton h-6 rounded w-1/3"/>
                        <div className="skeleton h-[300px] rounded-md"/>
                    </div>
                ) : (
                    <>
                    <div className="flex justify-between mb-4 text-gray-800">
                            <label>
                                開始時間：
                                <select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)}>
                                    {data.map(d => <option key={d.period} value={d.period}>{d.period}</option>)}
                                </select>
                            </label>
                            <label>
                                結束時間：
                                <select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)}>
                                    {data.map(d => <option key={d.period} value={d.period}>{d.period}</option>)}
                                </select>
                            </label>
                        </div>
                        <AgCharts options={options} />
                    </>
                )}
            </div>
        </>
    );
}