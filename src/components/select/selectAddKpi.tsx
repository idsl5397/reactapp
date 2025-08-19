import { ChevronDownIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { Company, Enterprise, Factory } from "@/types/EnterPriseType";
import { enterpriseService } from "@/services/selectCompany";
import { toast, Toaster } from "react-hot-toast";
import api from "@/services/apiService";
import { useauthStore } from "@/Stores/authStore";

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
        const res = await api.get("/Kpi/kpiCycle-list");
        return res.data;
    },
};

const SelectAddKpi = forwardRef((_, ref) => {
    const formRef = useRef<HTMLFormElement>(null);

    const [data, setData] = useState<Enterprise[]>([]);
    const [selectedEnterprise, setSelectedEnterprise] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedFactory, setSelectedFactory] = useState("");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [factories, setFactories] = useState<Factory[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [formData, setFormData] = useState<Partial<AddKpiFormData>>({});
    const [kpiCycles, setKpiCycles] = useState<KpiCycle[]>([]);
    const { userRole, userOrgId } = useauthStore();

    const fields = [
        { label: "指標項目 (必填的)", name: "indicatorName", type: "text" },
        { label: "指標細項 (必填的)", name: "detailItemName", type: "text" },
        { label: "指標/計算項目 (必填的)", name: "isIndicator", type: "select" },
        { label: "單位 (必填的)", name: "unit", type: "text" },
        { label: "基線值數據年限 (必填的)", name: "baselineYear", type: "number" },
        { label: "基線值 (必填的)", name: "baselineValue", type: "number" },
        { label: "公式", name: "comparisonOperator", type: "text" },
        { label: "目標值 (必填的)", name: "targetValue", type: "number" },
        { label: "備註", name: "remarks", type: "text" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const result = await enterpriseService.fetchData();
            setData(result);

            // 鎖定公司角色預設組織
            if (userRole === "company" && userOrgId) {
                const orgId = userOrgId.toString();
                outer: for (const enterprise of result) {
                    if (enterprise.id === orgId) {
                        setSelectedEnterprise(orgId);
                        setCompanies(enterprise.children || []);
                        setSelectedOrgId(orgId);
                        break;
                    }
                    for (const company of enterprise.children || []) {
                        if (company.id === orgId) {
                            setSelectedEnterprise(enterprise.id);
                            setCompanies(enterprise.children || []);
                            setSelectedCompany(orgId);
                            setFactories(company.children || []);
                            setSelectedOrgId(orgId);
                            break outer;
                        }
                        for (const factory of company.children || []) {
                            if (factory.id === orgId) {
                                setSelectedEnterprise(enterprise.id);
                                setCompanies(enterprise.children || []);
                                setSelectedCompany(company.id);
                                setFactories(company.children || []);
                                setSelectedFactory(orgId);
                                setSelectedOrgId(orgId);
                                break outer;
                            }
                        }
                    }
                }
            }

            const cycles = await kpiCycleService.fetchAll();
            setKpiCycles(cycles);
        };
        fetchData();
    }, [userRole, userOrgId]);

    useImperativeHandle(ref, () => ({
        getFormData: (): AddKpiFormData | null => {
            const form = formRef.current;

            // 1) 先用原生驗證：會自動聚焦第一個無效欄位
            if (form && !form.checkValidity()) {
                form.reportValidity();

                // 輔助：把第一個無效欄位捲到視窗中間
                const firstInvalid = form.querySelector<HTMLElement>(":invalid");
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                    // 某些瀏覽器不會自動 focus
                    (firstInvalid as HTMLInputElement | HTMLSelectElement).focus?.();
                }

                toast.error("請填寫所有必填欄位");
                return null;
            }

            // 2) selectedOrgId 是跨欄位推導值，不在原生驗證範圍內 → 額外檢查
            if (!selectedOrgId) {
                toast.error("請先完成階層選擇");
                // 盡可能聚焦最末階（優先 factory → company → enterprise）
                const toFocus =
                    form?.querySelector<HTMLSelectElement>("#factory") ||
                    form?.querySelector<HTMLSelectElement>("#company") ||
                    form?.querySelector<HTMLSelectElement>("#enterprise");
                toFocus?.focus();
                toFocus?.scrollIntoView({ behavior: "smooth", block: "center" });
                return null;
            }

            // 3) 業務層的必要欄位再保險一次（避免值存在但為空字串/NaN）
            const need = ["indicatorName", "detailItemName", "isIndicator", "category", "field", "unit"] as const;
            for (const key of need) {
                const v = (formData as any)[key];
                if (v === undefined || v === null || String(v).trim() === "") {
                    toast.error("請填寫所有必填欄位");
                    // 依 name 聚焦
                    const el = form?.querySelector<HTMLElement>(`[name="${key}"]`);
                    el?.focus();
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    return null;
                }
            }
            // baselineYear 需為數字
            if (formData.baselineYear == null || Number.isNaN(Number(formData.baselineYear))) {
                toast.error("請填寫基線值數據年限");
                const el = form?.querySelector<HTMLElement>(`[name="baselineYear"]`);
                el?.focus();
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        // 清除原生錯誤狀態（如果有）
        (e.target as HTMLInputElement | HTMLSelectElement).setCustomValidity?.("");
    };

    const handleEnterpriseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const enterpriseId = e.target.value;
        setSelectedEnterprise(enterpriseId);
        const enterprise = data.find((ent) => ent.id === enterpriseId);
        setCompanies(enterprise?.children || []);
        setSelectedCompany("");
        setSelectedFactory("");
        setFactories([]);
        setSelectedOrgId(enterpriseId || "");
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        setSelectedCompany(companyId);
        const company = companies.find((comp) => comp.id === companyId);
        setFactories(company?.children || []);
        setSelectedOrgId(companyId || "");
    };

    const handleFactoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const factoryId = e.target.value;
        setSelectedFactory(factoryId);
        setSelectedOrgId(factoryId || selectedCompany || selectedEnterprise || "");
    };

    const isCompany = userRole === "company";

    const getPlainLabel = (label: string) => label.replace(/\s*[（(].*?[）)]/g, "").trim();
    const isRequiredLabel = (label: string) => /必(要|填)的/.test(label);

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            {/* 用 form 包住內容，方便跑原生驗證 */}
            <form ref={formRef}>
                <fieldset className="mb-6 border rounded-md p-4">
                    <legend className="text-base font-semibold text-gray-700">📌 基本資料</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-900">階層1（企業/公司）(必填的)</label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="enterprise"
                                    name="enterprise"
                                    aria-label="請選擇階層 1"
                                    value={selectedEnterprise}
                                    onChange={handleEnterpriseChange}
                                    disabled={isCompany}
                                    required
                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 custom-select"
                                >
                                    <option value="">請選擇階層1</option>
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

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-900">階層2（公司/工廠）(必填的)</label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="company"
                                    name="company"
                                    aria-label="請選擇階層 2"
                                    value={selectedCompany}
                                    onChange={handleCompanyChange}
                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 custom-select"
                                    disabled={isCompany || !companies.length}
                                    required
                                >
                                    <option value="">請選擇階層2</option>
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

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-900">階層3（工廠）(必填的)</label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="factory"
                                    name="factory"
                                    aria-label="請選擇階層 3"
                                    value={selectedFactory}
                                    onChange={handleFactoryChange}
                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg白 py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 custom-select"
                                    disabled={isCompany || !factories.length}
                                    required
                                >
                                    <option value="">請選擇階層3</option>
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

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-900">工場/製程區</label>
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
                            <label className="block text-sm font-medium text-gray-900">KPI 循環 (必填的)</label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="kpiCycleId"
                                    name="kpiCycleId"
                                    aria-label="KPI 循環"
                                    onChange={handleInputChange}
                                    required
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
                            <label className="block text-sm font-medium text-gray-900">指標類型 (必填的)</label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="category"
                                    name="category"
                                    aria-label="指標類型"
                                    onChange={handleInputChange}
                                    required
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
                            <label className="block text-sm font-medium text-gray-900">領域 (必填的)</label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="field"
                                    name="field"
                                    aria-label="領域"
                                    onChange={handleInputChange}
                                    required
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
                                                id={name}
                                                name={name}
                                                aria-label={getPlainLabel(label)}
                                                onChange={handleInputChange}
                                                required={isRequiredLabel(label)}
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
                                            placeholder={type === "number" ? "請填寫數值" : `請填寫${getPlainLabel(label)}`}
                                            type={type}
                                            aria-label={label}
                                            required={isRequiredLabel(label)}
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
            </form>
        </>
    );
});

SelectAddKpi.displayName = "SelectAddKpi";
export default SelectAddKpi;