'use client'
import React, { useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";

// 模擬數據（年份 & 季度）
function getData() {
    return [
        { period: "2019Q1", EP: 80, PSM: 75, FR: 60, ECO: 55 },
        { period: "2019Q2", EP: 82, PSM: 76, FR: 62, ECO: 57 },
        { period: "2019Q3", EP: 83, PSM: 77, FR: 63, ECO: 58 },
        { period: "2019Q4", EP: 85, PSM: 78, FR: 65, ECO: 60 },
        { period: "2020Q1", EP: 86, PSM: 79, FR: 66, ECO: 61 },
        { period: "2020Q2", EP: 88, PSM: 80, FR: 68, ECO: 63 },
        { period: "2020Q3", EP: 89, PSM: 81, FR: 69, ECO: 64 },
        { period: "2020Q4", EP: 90, PSM: 83, FR: 70, ECO: 66 },
        { period: "2021Q1", EP: 91, PSM: 84, FR: 72, ECO: 68 },
        { period: "2021Q2", EP: 92, PSM: 85, FR: 74, ECO: 70 },
        { period: "2021Q3", EP: 93, PSM: 86, FR: 75, ECO: 71 },
        { period: "2021Q4", EP: 94, PSM: 87, FR: 77, ECO: 73 },
        { period: "2022Q1", EP: 95, PSM: 88, FR: 78, ECO: 75 },
        { period: "2022Q2", EP: 96, PSM: 89, FR: 80, ECO: 77 },
        { period: "2022Q3", EP: 97, PSM: 90, FR: 82, ECO: 78 },
        { period: "2022Q4", EP: 98, PSM: 91, FR: 83, ECO: 80 },
    ];
}

export default function LineExample() {
    const [startPeriod, setStartPeriod] = useState("2019Q1"); // 預設開始
    const [endPeriod, setEndPeriod] = useState("2022Q4"); // 預設結束

    const data = getData(); // 獲取數據

    // 篩選符合範圍的數據
    const filteredData = useMemo(() => {
        const startIndex = data.findIndex(d => d.period === startPeriod);
        const endIndex = data.findIndex(d => d.period === endPeriod);
        return data.slice(startIndex, endIndex + 1);
    }, [startPeriod, endPeriod, data]);

    const options: AgChartOptions = useMemo(() => ({
        data: filteredData,
        title: { text: "公司達成率趨勢圖" },
        series: [
            { type: "line", xKey: "period", yKey: "EP", stroke: "#FF5733", marker: { enabled: true }, yName: "EP" },
            { type: "line", xKey: "period", yKey: "PSM", stroke: "#3398FF", marker: { enabled: true }, yName: "PSM" },
            { type: "line", xKey: "period", yKey: "FR", stroke: "#33FF57", marker: { enabled: true }, yName: "FR" },
            { type: "line", xKey: "period", yKey: "ECO", stroke: "#FF33A1", marker: { enabled: true }, yName: "ECO" },
        ],
        axes: [
            { type: "category", position: "bottom", title: { text: "時間 (季度)" } },
            { type: "number", position: "left", title: { text: "達成率 (%)" }, min: 50, max: 100 },
        ],
        legend: { position: "right" },
    }), [filteredData]);

    return (
        <div className="w-[80%] mx-auto">
            {/* 篩選選單 */}
            <div className="flex justify-between mb-4">
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

            {/* 圖表 */}
            <AgCharts options={options} />
        </div>
    );
};
