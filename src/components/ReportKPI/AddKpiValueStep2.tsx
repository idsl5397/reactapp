import React, {useRef} from "react";
import { useStepContext} from "../StepComponse";

export interface Kpi {
    kpiDataId: number;
    kpiCategoryName: string;
    field: string;
    enField: string;
    indicatorName: string;
    detailItemName: string;
    company: string;
    productionSite?: string;
    unit: string;
    baselineYear: string;
    baselineValue: number;
    targetValue: number;
}

export default function AddKpiValueStep2() {
    const { stepData, updateStepData } = useStepContext();
    const kpiList = (stepData.kpiDataInput as { kpiList?: Kpi[] })?.kpiList || [];
    const kpiValues = (stepData.kpiReportInput || {}) as Record<string, string>;
    // 🔸建立一個 ref map
    const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const groupedKpis: Record<string, Record<string, Record<string, Kpi[]>>> = kpiList.reduce((acc, kpi) => {
        const category = kpi.kpiCategoryName;
        const field = kpi.field;
        const site = kpi.productionSite || "未填製程廠";

        if (!acc[category]) acc[category] = {};
        if (!acc[category][field]) acc[category][field] = {};
        if (!acc[category][field][site]) acc[category][field][site] = [];

        acc[category][field][site].push(kpi);

        return acc;
    }, {} as Record<string, Record<string,Record<string, Kpi[]>>>);


    const handleInputChange = (id: string | number, value: string | boolean) => {
        updateStepData({
            kpiReportInput: {
                ...kpiValues,
                [id]: value,
            },
        });
    };

    // ✅ 提供讓外部可以使用 ref 的方式
    (stepData as any)._focusMissingInput = (missingId: number) => {
        const el = inputRefs.current[missingId];
        if (el) el.focus();
    };


    return (
        <div className="space-y-4">

            {Object.entries(groupedKpis).map(([category, fields]) => (
                <div key={category} className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                        {category} 指標
                    </h2>

                    {Object.entries(fields).map(([fieldName, sites]) => {
                        const firstKpi = Object.values(sites)[0]?.[0]; // 抓第一筆 Kpi 取得 enField
                        const enField = firstKpi?.enField || "未知領域";

                        return (
                            <div key={fieldName} className="mb-6">
                                <h3 className="text-lg font-semibold text-secondary mb-3">
                                    {fieldName}（{enField}）
                                </h3>

                                {Object.entries(sites).map(([siteName, kpis]) => (
                                    <div key={siteName} className="mb-4">
                                        <h4 className="text-base font-medium text-gray-700 mb-2">
                                            製程廠：{siteName}
                                        </h4>

                                        <div className="space-y-4">
                                            {kpis.map((kpi) => (
                                                <div
                                                    key={kpi.kpiDataId}
                                                    className="card bg-base-100 shadow-md p-4 border border-gray-200"
                                                >
                                                    <div className="text-base font-semibold text-primary">
                                                        {kpi.indicatorName} - {kpi.detailItemName}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        公司：{kpi.company} ｜ 工廠/製程廠：{kpi.productionSite || "無"}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        單位：{kpi.unit} ｜ 基線年：{kpi.baselineYear}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        基線值：{kpi.baselineValue} ｜ 目標值：{kpi.targetValue}
                                                    </div>
                                                    <div className="mt-3">
                                                        <input
                                                            type="number"
                                                            placeholder="請輸入執行情況"
                                                            className="input input-bordered w-full"
                                                            name={`reportValue_${kpi.kpiDataId}`}
                                                            value={kpiValues[kpi.kpiDataId] || ""}
                                                            onChange={(e) =>
                                                                handleInputChange(kpi.kpiDataId, e.target.value)
                                                            }
                                                            disabled={Boolean(kpiValues[`skip_${kpi.kpiDataId}`])}
                                                            ref={(el) => {
                                                                inputRefs.current[kpi.kpiDataId] = el;
                                                            }}
                                                        />

                                                        <label className="flex items-center mt-2 text-sm text-gray-600">
                                                            <input
                                                                type="checkbox"
                                                                className="mr-2 checkbox"
                                                                checked={Boolean(kpiValues[`skip_${kpi.kpiDataId}`])}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    if (checked) {
                                                                        handleInputChange(kpi.kpiDataId, ""); // 清空
                                                                    }
                                                                    handleInputChange(`skip_${kpi.kpiDataId}`, checked);
                                                                }}
                                                            />
                                                            本期不適用
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}