import React from "react";
import { useStepContext, FormDataType } from "./StepComponse";
import {ChevronDownIcon} from "@heroicons/react/16/solid";


interface Enterprise {
    Id: string;
    Name: string;
    Children?: Enterprise[];
}
interface Step2Props {
    setEnterpriseTree: React.Dispatch<React.SetStateAction<Enterprise[] | null>>; // 用來設定 enterpriseTree 的函式
    setSelectedEnterprise: React.Dispatch<React.SetStateAction<string | null>>; // 用來設定選擇的企業
    setSelectedCompany: React.Dispatch<React.SetStateAction<string | null>>; // 用來設定選擇的公司
    setSelectedFactory: React.Dispatch<React.SetStateAction<string | null>>; // 用來設定選擇的公司
    companyId: number | null; // 公司ID，可能是 null
    selectedEnterprise: string | null; // 選擇的企業
    selectedCompany: string | null; // 選擇的公司
    selectedFactory: string | null;
    enterpriseTree: Enterprise[] | null; // 企業結構樹
}

interface ExtendedFormData extends FormDataType {
    Step2Props?: Step2Props;
}

export default function Step2() {
    const { stepData } = useStepContext();
    const step2Props = (stepData.step2Props as Step2Props) || {};

    const handleEnterpriseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        step2Props.setSelectedEnterprise(e.target.value);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        step2Props.setSelectedCompany(e.target.value);
    };

    const handleFactoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        step2Props.setSelectedFactory(e.target.value);
    };
    return (
        <div className="card-body p-6">
            <div className="mb-4">
                <div>
                    {step2Props.companyId ? (
                        <>
                            <div className="sm:col-span-2">
                                <label htmlFor="enterprise" className="block text-sm/6 font-medium text-gray-900">
                                    企業
                                </label>
                                <div className="mt-2 grid grid-cols-1">
                                    <select
                                        id="enterprise"
                                        name="enterprise"
                                        value={step2Props.selectedEnterprise || ""}
                                        onChange={handleEnterpriseChange}
                                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                                    >
                                        <option value="">{step2Props.selectedEnterprise || "請選擇企業"}</option>

                                    </select>
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                    />
                                </div>

                                <label htmlFor="company" className="block text-sm/6 font-medium text-gray-900">
                                    公司
                                </label>
                                <div className="mt-2 grid grid-cols-1">
                                    <select
                                        id="company"
                                        name="company"
                                        value={step2Props.selectedCompany || ""}
                                        onChange={handleCompanyChange}
                                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"

                                    >
                                        <option value="">{step2Props.selectedCompany || "請選擇公司"}</option>

                                    </select>
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="sm:col-span-2">
                                <label htmlFor="enterprise" className="block text-sm font-medium text-gray-900">
                                    企業
                                </label>
                                <select
                                    id="enterprise"
                                    name="enterprise"
                                    className="w-full"
                                    onChange={handleEnterpriseChange}
                                >
                                    <option value="">請選擇企業</option>
                                    {step2Props.enterpriseTree?.map((enterprise) => (
                                        <option key={enterprise.Id} value={enterprise.Name}>
                                            {enterprise.Name}
                                        </option>
                                    ))}
                                </select>

                                <label htmlFor="company" className="block text-sm font-medium text-gray-900">
                                    公司
                                </label>
                                <select
                                    id="company"
                                    name="company"
                                    className="w-full"
                                    onChange={handleCompanyChange}
                                >
                                    <option value="">請選擇公司</option>
                                    {step2Props.enterpriseTree?.map((company) => (
                                        <option key={company.Id} value={company.Name}>
                                            {company.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                    <label htmlFor="factory" className="block text-sm font-medium text-gray-900">
                        工廠
                    </label>
                    <select
                        id="factory"
                        name="factory"
                        className="w-full"
                        value={step2Props.selectedFactory || ""}
                        onChange={handleFactoryChange}
                    >
                        <option value="">請選擇工廠</option>
                        {step2Props.enterpriseTree?.map((factory) => (
                            <option key={factory.Id} value={factory.Name}>
                                {factory.Name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <fieldset>
                        <h2 className="text-sm/6 font-semibold text-gray-900">身分權限</h2>
                        <div className="mt-6 flex flex-row items-center gap-x-6">
                            <div className="flex items-center gap-x-3">
                                <input
                                    defaultChecked
                                    id="audit-admin"
                                    name="audit"
                                    type="radio"
                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                />
                                <label htmlFor="audit-admin"
                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                    員工
                                </label>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <input
                                    id="audit-power"
                                    name="audit"
                                    type="radio"
                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                />
                                <label htmlFor="audit-power"
                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                    工廠主管
                                </label>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <input
                                    id="audit-operator"
                                    name="audit"
                                    type="radio"
                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                />
                                <label htmlFor="audit-operator"
                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                    公司主管
                                </label>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <input
                                    id="audit-none"
                                    name="audit"
                                    type="radio"
                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                />
                                <label htmlFor="audit-none"
                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                    政府監管者
                                </label>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <input
                                    id="audit-none"
                                    name="audit"
                                    type="radio"
                                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                                />
                                <label htmlFor="audit-none"
                                       className="block text-sm/6 font-medium text-gray-900 whitespace-nowrap">
                                    審查委員
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}