import React, {useEffect, useRef} from "react";
import { useStepContext} from "../StepComponse";
import {Checkdata, KpiReportInput, SelectCompany} from "@/components/KPI/AddKPIvalue";
import axios from "axios";

const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const api = axios.create({
    baseURL: `${NPbasePath}/proxy`,
});
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
interface Step2Props {
    onSaveDraft?: (checkdata: Checkdata) => void;
}

export default function AddKpiValueStep2({ onSaveDraft }: Step2Props) {
    const { stepData, updateStepData } = useStepContext();
    const kpiList = (stepData.kpiDataInput as { kpiList?: Kpi[] })?.kpiList || [];
    const kpiValues = (stepData.kpiReportInput || {}) as Record<string, string>;
    // 🔸建立一個 ref map
    const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

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


    // 🧩 將填寫資料組成 KpiReportInput[]
    const generateReportInput = (): KpiReportInput[] => {
        return kpiList.map((kpi) => {
            const isSkipped = Boolean(kpiValues[`skip_${kpi.kpiDataId}`]);
            const valueRaw = kpiValues[kpi.kpiDataId];
            const parsedValue = valueRaw === "" ? null : Number(valueRaw);
            // ✅ 只有在 parsedValue 是 number 時才呼叫 isNaN
            let value: number | null = null;
            if (!isSkipped) {
                if (parsedValue !== null && !isNaN(parsedValue)) {
                    value = parsedValue;
                }
            }
            const remark = kpiValues[`skip_note_${kpi.kpiDataId}`] || "";

            return {
                kpiDataId: kpi.kpiDataId,
                value,
                isSkipped,
                remark,
            };
        });
    };


    const handleInputChange = (id: string | number, value: string | boolean) => {
        updateStepData({
            kpiReportInput: {
                ...kpiValues,
                [id]: value,
            },
        });
    };

    // ✅ 提供讓外部可以使用 ref 的方式
    (stepData as any)._focusMissingInput = (missingId: number, isNote = false) => {
        const key = isNote ? `skip_note_${missingId}` : missingId;
        const el = inputRefs.current[key];
        if (el) el.focus();
    };

    useEffect(() => {
        const fetchDrafts = async () => {
            const company = stepData.SelectCompany as SelectCompany;
            if (!company || !company.organizationId || !company.year || !company.quarter) return;

            try {
                const response = await api.get("/Kpi/load-kpi-draft", {
                    params: {
                        organizationId: company.organizationId,
                        year: company.year,
                        quarter: company.quarter,
                    },
                });

                const reports = response.data.data as KpiReportInput[];

                if (!reports || reports.length === 0) return;

                const restoredMap: Record<string, string> = {};
                for (const report of reports) {
                    if (report.isSkipped) {
                        restoredMap[`skip_${report.kpiDataId}`] = "true";
                        if (report.remark) {
                            restoredMap[`skip_note_${report.kpiDataId}`] = report.remark;
                        }
                    } else if (report.value !== null) {
                        restoredMap[report.kpiDataId] = report.value.toString();
                    }
                }

                updateStepData({
                    kpiReportInput: restoredMap,
                    Checkdata: {
                        organizationId: company.organizationId,
                        organizationName: company.organizationName,
                        year: company.year,
                        quarter: company.quarter,
                        reports,
                    },
                });

                console.log("✅ 成功載入草稿：", reports);
            } catch (error) {
                console.error("讀取草稿失敗", error);
            }
        };

        // 當元件 mount 或切換公司時執行
        fetchDrafts();
    }, []);

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
                                                        公司：{kpi.company} ｜ 工場/製程區：{kpi.productionSite || "無"}
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
                                                            aria-label="輸入執行情況"
                                                            placeholder="請輸入執行情況"
                                                            className={`input input-bordered w-full ${
                                                                kpiValues[`skip_${kpi.kpiDataId}`] ? "bg-gray-100 text-gray-500" : "bg-white"
                                                            }`}
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
                                                        {Boolean(kpiValues[`skip_${kpi.kpiDataId}`]) && (
                                                            <textarea
                                                                className="textarea textarea-bordered mt-2 w-full text-sm bg-white"
                                                                placeholder="請填寫本期不適用的原因"
                                                                value={kpiValues[`skip_note_${kpi.kpiDataId}`] || ""}
                                                                onChange={(e) =>
                                                                    handleInputChange(`skip_note_${kpi.kpiDataId}`, e.target.value)
                                                                }
                                                                ref={(el) => {
                                                                    inputRefs.current[`skip_note_${kpi.kpiDataId}`] = el;
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-end mt-10">
                                    <button
                                        className="btn btn-outline btn-primary px-6 py-2 text-sm font-semibold"
                                        onClick={() => {
                                            if (onSaveDraft) {
                                                const currentReports = generateReportInput();
                                                const company = stepData.SelectCompany as SelectCompany;

                                                onSaveDraft({
                                                    organizationId: company.organizationId,
                                                    organizationName: company.organizationName,
                                                    year: company.year,
                                                    quarter: company.quarter,
                                                    reports: currentReports,
                                                });

                                                updateStepData({
                                                    Checkdata: {
                                                        organizationId: company.organizationId,
                                                        organizationName: company.organizationName,
                                                        year: company.year,
                                                        quarter: company.quarter,
                                                        reports: currentReports,
                                                    }
                                                });
                                            }
                                        }}
                                    >
                                        暫存填寫內容
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}