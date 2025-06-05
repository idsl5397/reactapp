import React, { useImperativeHandle, forwardRef, useState, useEffect } from "react";
import { IMaskInput } from 'react-imask';
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import dynamic from 'next/dynamic';
import { Company, Enterprise, Factory } from "@/types/EnterPriseType";
import {ChevronDownIcon} from "@heroicons/react/16/solid";
import {enterpriseService} from "@/services/selectCompany";


const CreatableSelect = dynamic(() => import('react-select/creatable'), {
    ssr: false,
});

const api = axios.create({
    baseURL: '/proxy',
});

interface CommitteeUser {
    id: string;
    nickName: string;
}

interface Option {
    value: string;
    label: string;
}


export interface AddSuggestFormData {
    organizationId: string;
    date: string;
    eventType: string;
    category: string;
    committee: string;
    suggestion: string;
    suggestionType: string;
    department: string;
    isAdopted: string;
    adoptedOther: string | null;
    improveDetail: string;
    manpower: number | null;
    budget: number | null;
    isCompleted: string;
    completedOther: string | null;
    doneYear: string;
    doneMonth: string;
    isParallel: string;
    parallelOther: string | null;
    execPlan: string | null;
    remark: string | null;
}

export default forwardRef(function SelectAddAll(_, ref) {
    const [formData, setFormData] = useState<Partial<AddSuggestFormData>>({});
    const [data, setData] = useState<Enterprise[]>([]);
    const [selectedEnterprise, setSelectedEnterprise] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedFactory, setSelectedFactory] = useState("");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [factories, setFactories] = useState<Factory[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState("");

    // ✅ 這裡讓父元件可以透過 ref 拿到 formData
    useImperativeHandle(ref, () => ({
        getFormData: () => formData,
    }));

    const handleChange = (field: keyof AddSuggestFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const [committeeOptions, setCommitteeOptions] = useState<Option[]>([]);
    const [isCommitteeLoading, setIsCommitteeLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const result = await enterpriseService.fetchData();
            setData(result);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchCommittees = async () => {
            const res = await api.get<CommitteeUser[]>("/Suggest/GetCommitteeUsers"); // 根據你的路由調整
            console.log(res);
            // setCommitteeOptions(res.data);
            const mapped = res.data.map((user) => ({
                value: user.id,
                label: user.nickName,
            }));
            setCommitteeOptions(mapped);
        };
        fetchCommittees();
    }, []);

    const handleCreateCommittee = (inputValue: string) => {
        setIsCommitteeLoading(true);
        setTimeout(() => {
            const newOption = { label: inputValue, value: inputValue }; // value 預設用名稱
            setCommitteeOptions((prev) => [...prev, newOption]);
            handleChange("committee", inputValue); // 如果你只要存 nickname
            setIsCommitteeLoading(false);
        }, 500);
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

    useImperativeHandle(ref, () => ({
        getFormData: (): AddSuggestFormData | null => {
            if (!formData.date || !formData.eventType || !formData.committee || !formData.category ||
                !formData.suggestion || !formData.suggestionType || !formData.department ||
                !formData.isAdopted || !formData.improveDetail || !formData.isCompleted ||
                !formData.doneYear || !formData.doneMonth || formData.isParallel === undefined || formData.isParallel === '') {
                alert("請填寫所有必填欄位");
                return null;
            }
            return {
                organizationId: selectedOrgId,
                ...formData,
            } as AddSuggestFormData;
        },
    }));
    return (
        <>
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
                <label className="block text-sm font-medium text-gray-900">年月日</label>
                <input type="date" value={formData.date ?? ""} onChange={(e) => handleChange("date", e.target.value)}
                       className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">會議/活動</label>
                <select value={formData.eventType} onChange={(e) => handleChange("eventType", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="書面審查會議">書面審查會議</option>
                    <option value="實地進廠查驗">實地進廠查驗</option>
                    <option value="領先指標輔導">領先指標輔導</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">類別</label>
                <select value={formData.category} onChange={(e) => handleChange("category", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="PSM">PSM</option>
                    <option value="EP">EP</option>
                    <option value="FR">FR</option>
                    <option value="ECO">ECO</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">
                    委員（可搜尋或新增）
                </label>
                <CreatableSelect
                    isClearable
                    isDisabled={isCommitteeLoading}
                    isLoading={isCommitteeLoading}
                    options={committeeOptions}
                    value={committeeOptions.find((o) => o.label === formData.committee) || null}
                    onChange={(option: any) => handleChange("committee", option?.label || "")}
                    onCreateOption={handleCreateCommittee}
                    placeholder="請選擇或輸入委員名"
                    className="mt-2"
                />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">建議</label>
                <textarea
                    placeholder="請輸入建議"
                    value={formData.suggestion}
                    onChange={(e) => handleChange("suggestion", e.target.value)}
                    rows={3}
                    className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 resize-y"
                />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">建議類別</label>
                <select value={formData.suggestionType} onChange={(e) => handleChange("suggestionType", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇建議類別</option>
                    <option value="改善建議">改善建議</option>
                    <option value="精進建議">精進建議</option>
                    <option value="可資借鏡">可資借鏡</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">負責部門</label>
                <input type="text" placeholder="請輸入負責部門" value={formData.department ?? ""}
                       onChange={(e) => handleChange("department", e.target.value)}
                       className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">是否參採</label>
                <select value={formData.isAdopted} onChange={(e) => handleChange("isAdopted", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                    <option value="2">不參採</option>
                    <option value="3">詳備註</option>
                </select>
                {formData.isAdopted === "3" && (
                    <input type="text" placeholder="請輸入補充" value={formData.adoptedOther ?? ''}
                           onChange={(e) => handleChange("adoptedOther", e.target.value || null)}
                           className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
                )}
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">改善對策/辦理情形</label>
                <textarea
                    placeholder="請輸入改善對策/辦理情形"
                    value={formData.improveDetail}
                    onChange={(e) => handleChange("improveDetail", e.target.value)}
                    rows={3}
                    className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 resize-y"
                />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">投入人力(人/月)</label>
                <input type="number" placeholder="如沒有請留空" value={formData.manpower ?? ''}
                       onChange={(e) => handleChange("manpower", parseInt(e.target.value) || null)}
                       className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">投入(改善)經費 (元)</label>
                <input type="number" placeholder="如沒有請留空" step="0.01" value={formData.budget ?? ''}
                       onChange={(e) => handleChange("budget", parseFloat(e.target.value) || null)}
                       className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">是否完成改善/辦理</label>
                <select value={formData.isCompleted} onChange={(e) => handleChange("isCompleted", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                    <option value="2">不參採</option>
                    <option value="3">詳備註</option>
                </select>
                {formData.isCompleted === "3" && (
                    <input type="text" placeholder="請輸入補充" value={formData.completedOther ?? ''}
                           onChange={(e) => handleChange("completedOther", e.target.value || null)}
                           className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
                )}
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">預計完成年份</label>
                <IMaskInput mask="000" placeholder="例如: 113" value={formData.doneYear}
                            onAccept={(val) => handleChange("doneYear", val)}
                            className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">預計完成月份</label>
                <IMaskInput mask="00" placeholder="例如: 07" value={formData.doneMonth}
                            onAccept={(val) => handleChange("doneMonth", val)}
                            className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">是否平行展開推動執行</label>
                <select value={formData.isParallel} onChange={(e) => handleChange("isParallel", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                    <option value="2">不參採</option>
                    <option value="3">詳備註</option>
                </select>
                {formData.isParallel === "3" && (
                    <input type="text" placeholder="請輸入補充" value={formData.parallelOther ?? ''}
                           onChange={(e) => handleChange("parallelOther", e.target.value || null)}
                           className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
                )}
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">平行展開推動執行規劃</label>
                <input type="text" placeholder="請輸入執行規劃" value={formData.execPlan ?? ''}
                       onChange={(e) => handleChange("execPlan", e.target.value || null)}
                       className="w-full border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">備註</label>
                <input type="text" placeholder="請輸入備註" value={formData.remark ?? ''}
                       onChange={(e) => handleChange("remark", e.target.value || null)}
                       className="w-full border border-gray-300 rounded-md px-3 py-2"/>
            </div>
        </>
    );
});
