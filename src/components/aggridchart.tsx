'use client'
import React, { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";

// 獲取數據的函數
function getData() {
    return [
        { asset: "Stocks", amount: 60000 },
        { asset: "Bonds", amount: 40000 },
        { asset: "Cash", amount: 7000 },
        { asset: "Real Estate", amount: 5000 },
        { asset: "Commodities", amount: 3000 },
    ];
}

export default function ChartExample(){
    const data = getData(); // 取得數據
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0); // 計算總金額

    // 使用 useMemo 來提高效能，避免不必要的 re-render
    const options: AgChartOptions = useMemo(() => ({
        data: data,
        title: { text: "Portfolio Composition" }, // ✅ 設定標題
        series: [
            {
                type: "pie", // ✅ 使用 Pie 圖表
                angleKey: "amount", // ✅ 設定數值鍵
                labelKey: "asset", // ✅ 設定標籤鍵 (顯示類別名稱)
                innerRadiusRatio: 0.6, // ✅ 設定為環形圖 (可選)
                sectorLabel: {
                    enabled: true, // ✅ 顯示百分比
                    formatter: ({ datum }) => {
                        const percentage = ((datum.amount / totalAmount) * 100).toFixed(1); // ✅ 手動計算百分比
                        return `${percentage}%`;
                    },
                },
            },
        ],
        legend: { position: "right" }, // ✅ 設定圖例在右側
    }), []); // ✅ 只在初始化時計算 options，避免每次 render 重新計算

    return <AgCharts options={options} />;
};
