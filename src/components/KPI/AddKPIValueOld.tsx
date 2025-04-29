'use client';

import React, {useState} from 'react';
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise, {SelectionPayload} from "@/components/select/selectEnterprise";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: "/proxy",
});


export default function AddKPIvalue() {
    const [selectedOrg, setSelectedOrg] = useState<SelectionPayload>({ orgId: "" });
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告" , href: "/reportEntry" },
        { label: "新增績效指標報告"}
    ];
    const handleSubmit = async () => {
        if (!selectedOrg.orgId) {
            toast.error("請先選擇公司或工廠！");
            return;
        }

        try {
            const response = await api.get("/Kpi/kpidata-for-report", {
                params: { organizationId: selectedOrg.orgId },
            });

            const res = response.data;

            if (!res.success) {
                toast(res.message || "查詢失敗");
                return;
            }

            const kpiDataList = res.data;

            if (!Array.isArray(kpiDataList) || kpiDataList.length === 0) {
                toast("該公司尚無 KPI 資料可填報", { icon: "⚠️" });
                return;
            }

            // ✅ 成功資料流程
            console.log("抓到的 KPI 資料：", kpiDataList);
            toast.success(`抓到 ${kpiDataList.length} 筆 KPI 指標，可建立報告`);

            // ➕ 導向下一頁 or 顯示填寫畫面
            // router.push("/report/fill") 或 setState 展開填報
        } catch (error: any) {
            console.error("API Error:", error);
            toast.error(`API 發生錯誤：${error.message}`);
        }
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-5 py-12 md:px-20 lg:px-20 xl:px-72">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        新增績效指標報告
                    </h1>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="grid grid-cols-1 md:mt-10 lg:mt-10 xl:mt-10 gap-4">
                            <SelectEnterprise showYearRange={false}  onSelectionChange={(payload) => setSelectedOrg(payload)}/>

                        </div>
                    </div>
                    <div className="flex justify-end gap-x-8">
                        <button
                            type="button"
                            className="btn btn-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm rounded-md"
                            onClick={handleSubmit}
                        >
                            下一步
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};