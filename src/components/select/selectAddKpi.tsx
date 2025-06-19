import { ChevronDownIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { Company, Enterprise, Factory } from "@/types/EnterPriseType";
import { enterpriseService } from "@/services/selectCompany";
import axios from "axios";

const api = axios.create({
    baseURL: "/proxy",
});

export interface AddKpiFormData {
    kpiCycleId: number;
    organizationId: string;
    productionSiteName?: string;
    category?: string;
    field?: string;
    indicatorName: string;
    detailItemName: string;
    unit: string;
    isIndicator: string;
    comparisonOperator: string;
    baselineYear: number;
    baselineValue: number;
    targetValue: number;
    remarks?: string;
}

export interface KpiCycle {
    id: number;
    cycleName: string;
    startYear: number;
    endYear: number;
}

export const kpiCycleService = {
    async fetchAll(): Promise<KpiCycle[]> {
        const res = await api.get('/Kpi/kpiCycle-list');
        return res.data;
    },
};

const SelectAddKpi = forwardRef((_, ref) => {
    const [data, setData] = useState<Enterprise[]>([]);
    const [selectedEnterprise, setSelectedEnterprise] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedFactory, setSelectedFactory] = useState("");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [factories, setFactories] = useState<Factory[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [formData, setFormData] = useState<Partial<AddKpiFormData>>({});
    const [kpiCycles, setKpiCycles] = useState<KpiCycle[]>([]);
    const fields = [
        { label: "指標項目", name: "indicatorName", type: "text" },
        { label: "指標細項", name: "detailItemName", type: "text" },
        { label: "指標/計算項目", name: "isIndicator", type: "select" },
        { label: "單位", name: "unit", type: "text" },
        { label: "基線值數據年限", name: "baselineYear", type: "number" },
        { label: "基線值", name: "baselineValue", type: "number" },
        { label: "公式", name: "comparisonOperator", type: "text" },
        { label: "目標值", name: "targetValue", type: "number" },
        { label: "備註 (非必填)", name: "remarks", type: "text" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const result = await enterpriseService.fetchData();
            setData(result);

            const cycles = await kpiCycleService.fetchAll();
            setKpiCycles(cycles);
        };
        fetchData();
    }, []);

    useImperativeHandle(ref, () => ({
        getFormData: (): AddKpiFormData | null => {
            if (!selectedOrgId || !formData.indicatorName || !formData.detailItemName|| !formData.isIndicator || !formData.category || !formData.field || !formData.unit || formData.baselineYear == null) {
                alert("請填寫所有必填欄位");
                return null;
            }
            return {
                organizationId: selectedOrgId,
                ...formData,
            } as AddKpiFormData;
        },
    }));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value || undefined,
        }));
    };

    const handleEnterpriseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const enterpriseId = e.target.value;
        setSelectedEnterprise(enterpriseId);
        const enterprise = data.find((ent) => ent.id === enterpriseId);
        setCompanies(enterprise?.children || []);
        setSelectedCompany("");
        setSelectedFactory("");
        setFactories([]);
        setSelectedOrgId(enterpriseId);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        setSelectedCompany(companyId);
        const company = companies.find((comp) => comp.id === companyId);
        setFactories(company?.children || []);
        setSelectedOrgId(companyId);
    };

    const handleFactoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const factoryId = e.target.value;
        setSelectedFactory(factoryId);
        setSelectedOrgId(factoryId || selectedCompany || selectedEnterprise);
    };

    return (
        <>
            <fieldset className="mb-6 border rounded-md p-4">
                <legend className="text-base font-semibold text-gray-700">📌 基本資料</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900">階層1（企業/公司）</label>
                        <div className="mt-2 grid grid-cols-1">
                            <select
                                value={selectedEnterprise}
                                onChange={handleEnterpriseChange}
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 custom-select"
                            >
                                <option value="">請選擇階層1</option>
                                {data.map((enterprise) => (
                                    <option key={enterprise.id} value={enterprise.id}>{enterprise.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900">階層2（公司/工廠）</label>
                        <div className="mt-2 grid grid-cols-1">
                            <select
                                value={selectedCompany}
                                onChange={handleCompanyChange}
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 custom-select"
                                disabled={!companies.length}
                            >
                                <option value="">請選擇階層2</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900">階層3（工廠）</label>
                        <div className="mt-2 grid grid-cols-1">
                            <select
                                value={selectedFactory}
                                onChange={handleFactoryChange}
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 custom-select"
                                disabled={!factories.length}
                            >
                                <option value="">請選擇階層3</option>
                                {factories.map((factory) => (
                                    <option key={factory.id} value={factory.id}>{factory.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900">工場/製程區 (非必填)</label>
                        <div className="mt-2">

                            <input
                                type="text"
                                aria-label="工場/製程區"
                                placeholder="如有區分請填寫"
                                name="productionSiteName"
                                onChange={handleInputChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
            <fieldset className="mb-6 border rounded-md p-4">
                <legend className="text-base font-semibold text-gray-700">🧾 績效指標內容</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900">KPI 循環</label>
                        <div className="mt-2 grid grid-cols-1">
                            <select
                                name="kpiCycleId"
                                onChange={handleInputChange}
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 custom-select"
                            >
                                <option value="">請選擇</option>
                                {kpiCycles.map((cycle) => (
                                    <option key={cycle.id} value={cycle.id}>
                                        {cycle.cycleName}（{cycle.startYear}–{cycle.endYear}）
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900">指標類型</label>
                        <div className="mt-2 grid grid-cols-1">
                            <select
                                name="category"
                                onChange={handleInputChange}
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                            >
                                <option value="">請選擇</option>
                                <option value="基礎型">基礎型</option>
                                <option value="客製型">客製型</option>
                            </select>
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900">領域</label>
                        <div className="mt-2 grid grid-cols-1">
                            <select
                                name="field"
                                onChange={handleInputChange}
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                            >
                                <option value="">請選擇</option>
                                <option value="PSM">PSM</option>
                                <option value="EP">EP</option>
                                <option value="FR">FR</option>
                                <option value="ECO">ECO</option>
                            </select>
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                        </div>
                    </div>
                    {fields.map(({ label, name, type }) => (
                        <div className="mt-4" key={name}>
                            <label className="block text-sm font-medium text-gray-900">{label}</label>
                            <div className="mt-2">
                                {type === "select" ? (
                                    <div className="relative">
                                        <select
                                            name={name}
                                            onChange={handleInputChange}
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                        >
                                            <option value="">請選擇</option>
                                            <option value="true">指標項目</option>
                                            <option value="false">計算項目</option>
                                        </select>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 text-gray-500 sm:size-4"
                                        />
                                    </div>
                                ) : (
                                    <input
                                        name={name}
                                        placeholder={type === "number" ? "請填寫數值" : `請填寫${label}`}
                                        type={type}
                                        step="any"
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>
        </>
    );
});
SelectAddKpi.displayName = "SelectAddKpi";
export default SelectAddKpi;
