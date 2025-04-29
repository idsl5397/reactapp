'use client';

import React, {useRef} from 'react';
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectAddKpi, {AddKpiFormData} from "@/components/select/selectAddKpi";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: "/proxy",
});


export default function AddKPI() {
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "績效指標" , href: "/kpi" },
        { label: "新增績效指標"}
    ];
    const formRef = useRef<{ getFormData: () => AddKpiFormData | null }>(null);

    const handleSubmit = async () => {
        const formData = formRef.current?.getFormData();
        console.log(formData);
        if (formData) {
            const payload = {
                OrganizationId: parseInt(formData.organizationId), // 前端傳的是 string，要轉成 int
                ProductionSite: formData.productionSiteName || "",
                KpiCategoryName: formData.category!,
                FieldName: formData.field!,
                IndicatorName: formData.indicatorName,
                DetailItemName: formData.detailItemName,
                Unit: formData.unit,
                IsApplied: true, // 你可以加 checkbox 控制
                BaselineYear: `${formData.baselineYear}年`,
                BaselineValue: formData.baselineValue,
                TargetValue: formData.targetValue,
                Remarks: formData.remarks || ""
            };

            try {
                const res = await api.post("/Kpi/import-single", payload);
                toast.success(res.data.message);
            } catch (err: any) {
                const msg = err.response?.data?.message ?? "匯入失敗，請稍後再試";
                toast.error(msg);
            }
        }
    };
    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        新增績效指標
                    </h1>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <SelectAddKpi ref={formRef} />

                        </div>
                    </div>
                        <div className="flex justify-end gap-x-8">
                            <button
                                type="button"
                                className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                                onClick={handleSubmit}
                            >
                                送出
                            </button>
                        </div>

                    {/*<div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">*/}
                    {/*    <div className="space-y-8 w-full mx-auto">*/}
                    {/*        <p>檢視檔案</p>*/}
                    {/*        <div className="mt-6 px-4 lg:px-6">*/}
                    {/*            <Aggrid rowData={rowData} columnDefs={columnDefs}/>*/}
                    {/*        </div>*/}
                    {/*        <div className="flex justify-end gap-x-8">*/}
                    {/*            <Link href=" ">*/}
                    {/*                <button*/}
                    {/*                    type="button"*/}
                    {/*                    className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"*/}
                    {/*                >*/}
                    {/*                    送出*/}
                    {/*                </button>*/}
                    {/*            </Link>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </>
    );
};