import { ChevronDownIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { Company, Enterprise, Factory } from "@/types/EnterPriseType";
import { enterpriseService } from "@/services/selectCompany";

export interface AddKpiFormData {
    organizationId: string;
    productionSiteName?: string;
    category?: string;
    field?: string;
    indicatorName: string;
    detailItemName: string;
    unit: string;
    baselineYear: number;
    baselineValue: number;
    targetValue: number;
    remarks?: string;
}

const SelectAddKpi = forwardRef((_, ref) => {
    const [data, setData] = useState<Enterprise[]>([]);
    const [selectedEnterprise, setSelectedEnterprise] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedFactory, setSelectedFactory] = useState("");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [factories, setFactories] = useState<Factory[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [formData, setFormData] = useState<Partial<AddKpiFormData>>({});

    useEffect(() => {
        const fetchData = async () => {
            const result = await enterpriseService.fetchData();
            setData(result);
        };
        fetchData();
    }, []);

    useImperativeHandle(ref, () => ({
        getFormData: (): AddKpiFormData | null => {
            if (!selectedOrgId || !formData.indicatorName || !formData.detailItemName || !formData.category || !formData.field || !formData.unit || formData.baselineYear == null) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-900">階層1（企業/公司）</label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            value={selectedEnterprise}
                            onChange={handleEnterpriseChange}
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
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

                <div>
                    <label className="block text-sm font-medium text-gray-900">階層2（公司/工廠）</label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
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

                <div>
                    <label className="block text-sm font-medium text-gray-900">階層3（工廠）</label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            value={selectedFactory}
                            onChange={handleFactoryChange}
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
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

                <div>
                    <label className="block text-sm font-medium text-gray-900">工廠/製程廠 (非必填)</label>
                    <div className="mt-2">

                        <input
                            type="text"
                            name="productionSiteName"
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>
                </div>
                <div>
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
                <div>
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

                {[
                    ["指標項目", "indicatorName"],
                    ["指標細項", "detailItemName"],
                    ["單位", "unit"],
                    ["基線值數據年限", "baselineYear"],
                    ["基線值", "baselineValue"],
                    ["目標值", "targetValue"],
                    ["備註 (非必填)", "remarks"]
                ].map(([label, name]) => (
                    <div key={name}>
                        <label className="block text-sm font-medium text-gray-900">{label}</label>
                        <div className="mt-2">
                            <input
                                name={name}
                                type={name.includes("Value") || name.includes("Year") ? "number" : "text"}
                                step="any"
                                onChange={handleInputChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
});
SelectAddKpi.displayName = "SelectAddKpi";
export default SelectAddKpi;
