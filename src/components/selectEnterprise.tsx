import {ChevronDownIcon} from "@heroicons/react/16/solid";
import React, {useEffect, useState} from "react";
import {enterpriseService} from "@/services/selectCompany";
import {Company, Enterprise, Factory} from "@/types/EnterPriseType";

export default function selectEnterprise() {
    const [data, setData] = useState<Enterprise[]>([]); // 保存企業數據
    const [selectedEnterprise, setSelectedEnterprise] = useState(""); // 選中的企業
    const [selectedCompany, setSelectedCompany] = useState(""); // 選中的公司
    const [companies, setCompanies] = useState<Company[]>([]); // 當前顯示的公司
    const [factories, setFactories] = useState<Factory[]>([]); // 當前顯示的工廠

    // 請求 API 獲取企業數據
    useEffect(() => {
        const fetchData = async () => {
            const x = await enterpriseService.fetchData();
            setData(x);
        };
        fetchData(); // 調用內部異步函式
    }, []);

    // 當選擇企業時更新公司列表
    const handleEnterpriseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const enterpriseId = e.target.value;
        setSelectedEnterprise(enterpriseId);
        // 根據選中的企業查找公司
        const enterprise = data.find((ent) => ent.id === enterpriseId);
        setCompanies(enterprise ? enterprise.children : []);
        setFactories([]); // 重置工廠
        setSelectedCompany(""); // 重置選中的公司
    };

    // 當選擇公司時更新工廠列表
    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        setSelectedCompany(companyId);

        // 根據選中的公司查找工廠
        const company = companies.find((comp) => comp.id === companyId);
        setFactories(company ? company.children : []);
    };

    return (
        <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                    <label htmlFor="enterprise" className="block text-sm/6 font-medium text-gray-900">
                        企業
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            id="enterprise"
                            name="enterprise"
                            value={selectedEnterprise}
                            onChange={handleEnterpriseChange}
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                        >
                            <option value="">請選擇企業</option>
                            {data.map((enterprise) => (
                                <option key={enterprise.id} value={enterprise.id}>
                                    {enterprise.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="company" className="block text-sm/6 font-medium text-gray-900">
                        公司
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            id="company"
                            name="company"
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                            disabled={!companies.length} // 如果沒有公司數據則禁用
                        >
                            <option value="">請選擇公司</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="factory" className="block text-sm/6 font-medium text-gray-900">
                        工廠
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            id="factory"
                            name="factory"
                            autoComplete="factory-name"
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                            disabled={!factories.length} // 如果沒有工廠數據則禁用
                        >
                            <option value="">請選擇工廠</option>
                            {factories.map((factory) => (
                                <option key={factory.id} value={factory.id}>
                                    {factory.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                        年份
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            id="year"
                            name="year"
                            autoComplete="year-name"
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                        >
                            <option value="">請選擇年份</option>
                            <option value="110">110</option>
                            <option value="111">111</option>
                            <option value="112">112</option>
                            <option value="113">113</option>

                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="quarter" className="block text-sm/6 font-medium text-gray-900">
                        季度
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            id="quarter"
                            name="quarter"
                            autoComplete="quarter-name"
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                        >
                            <option value="">請選擇季度</option>
                            <option value="Q1">Q1</option>
                            <option value="Q2">Q2</option>
                            <option value="Q3">Q3</option>
                            <option value="Q4">Q4</option>

                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
