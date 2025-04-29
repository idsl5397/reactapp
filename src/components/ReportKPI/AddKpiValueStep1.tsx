import React, {useEffect, useState} from "react";
import { useStepContext} from "../StepComponse";
import SelectEnterprise from "@/components/select/selectEnterprise";
import {SelectCompany} from "@/components/KPI/AddKPIvalue";


const quarters = [
    { label: 'Q2', value: 'Q2' },
    { label: 'Q4', value: 'Q4' },
    { label: '整年度 (Y)', value: 'Y' },
];

export default function AddKpiValueStep1() {
    const { stepData, updateStepData } = useStepContext();
    const currentYear = new Date().getFullYear() - 1911; // 民國年
    const [yearOptions, setYearOptions] = useState<string[]>([]);
    const selectedYear = (stepData.SelectCompany as SelectCompany)?.year || "";
    const selectedQuarter = (stepData.SelectCompany as SelectCompany)?.quarter || "";

    useEffect(() => {
        const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
        setYearOptions(years);
    }, [currentYear]);

    const handleSelectChange = (name: keyof SelectCompany, value: string | number) => {
        const current = (stepData.SelectCompany as SelectCompany) || {};
        updateStepData({
            SelectCompany: {
                ...current,
                [name]: name === "organizationId" || name === "year" ? Number(value) : value,
            },
        });
    };


    return (
        <div className="card w-full bg-white shadow-md rounded-lg">
            <div className="card-body p-6">
                <div className="mb-4">
                    <SelectEnterprise
                        showYearRange={false}
                        onSelectionChange={(payload) => {
                            handleSelectChange("organizationId", payload.orgId);
                        }}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">請選擇民國年度</label>
                        <select
                            className="select select-bordered w-full"
                            value={selectedYear}
                            onChange={(e) => handleSelectChange("year", e.target.value)}
                        >
                            <option value="">請選擇年度</option>
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>{year} 年</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">請選擇季度</label>
                        <select
                            className="select select-bordered w-full"
                            value={selectedQuarter}
                            onChange={(e) => handleSelectChange("quarter", e.target.value)}
                        >
                            <option value="">請選擇季度</option>
                            {quarters.map((q) => (
                                <option key={q.value} value={q.value}>{q.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

            </div>
        </div>

    );
}