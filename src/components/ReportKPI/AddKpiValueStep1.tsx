import React, {useEffect, useState} from "react";
import { useStepContext} from "../StepComponse";
import SelectEnterprise from "@/components/select/selectEnterprise";
import {SelectCompany} from "@/components/KPI/AddKPIvalue";
import {ChevronDownIcon} from "@heroicons/react/16/solid";


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
                        <div  className="mt-2 grid grid-cols-1">
                            <select
                                id="year"
                                name="year"
                                aria-label="選擇民國年度"
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                value={selectedYear}
                                onChange={(e) => handleSelectChange("year", e.target.value)}
                            >
                                <option value="">請選擇年度</option>
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>{year} 年</option>
                                ))}
                            </select>
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">請選擇季度</label>
                        <div className="mt-2 grid grid-cols-1">
                            <select
                                id="quarter"
                                name="quarter"
                                aria-label="選擇季度"
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                value={selectedQuarter}
                                onChange={(e) => handleSelectChange("quarter", e.target.value)}
                            >
                                <option value="">請選擇季度</option>
                                {quarters.map((q) => (
                                    <option key={q.value} value={q.value}>{q.label}</option>
                                ))}
                            </select>
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}