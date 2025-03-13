'use client'
import React, { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";

// 取得委員建議類別的數據
function getSuggestionData() {
    return [
        { category: "PSM", count: 50 },
        { category: "EP", count: 30 },
        { category: "FR", count: 15 },
        { category: "ECO", count: 5 },
    ];
}

export default function SuggestionPieChart() {
    const data = getSuggestionData(); // 取得數據
    const totalCount = data.reduce((sum, item) => sum + item.count, 0); // 計算總數量

    const options: AgChartOptions = useMemo(() => ({
        data: data,
        title: { text: "委員建議類別占比" }, // ✅ 設定標題
        series: [
            {
                type: "pie",
                angleKey: "count", // ✅ 數值鍵 (建議數量)
                labelKey: "category", // ✅ 類別名稱
                innerRadiusRatio: 0.6, // ✅ 設定為環形圖
                calloutLabel: {
                    enabled: true, // ✅ 啟用標籤
                    fontSize: 14, // ✅ 設定標籤大小
                    fontWeight: "bold", // ✅ 設定標籤加粗
                    formatter: ({ datum }) => `${datum.category} (${datum.count})`, // ✅ 類別 + 數量
                },
                sectorLabel: {
                    enabled: true, // ✅ 顯示標籤在扇形內部
                    fontSize: 12,
                    color: "white", // ✅ 讓內部標籤更清楚
                    formatter: ({ datum }) => {
                        const percentage = ((datum.count / totalCount) * 100).toFixed(1);
                        return `${percentage}%`; // ✅ 顯示百分比
                    },
                },
                labelPlacement: "outside", // ✅ 確保標籤放在扇形外
                labelSpacing: 8, // ✅ 增加標籤間距，防止重疊
                strokeWidth: 2, // ✅ 增加邊界線，提高對比度
                stroke: "#ffffff", // ✅ 設定邊界線顏色
            },
        ],
        legend: {
            position: "right", // ✅ 圖例放右側
            enabled: true,
            item: {
                label: {
                    fontSize: 14, // 設置圖例標籤的字體大小
                    fontWeight: "bold", // 設置圖例標籤的字體加粗
                },
            },
        },
    }), []);

    return (
        <div style={{ width: "100%", height: "500px" }}>
            <AgCharts options={options} />
        </div>
    );
}