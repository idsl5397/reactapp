'use client'
import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise from "@/components/select/selectEnterprise";
import Aggridchart from "@/components/aggridchart";
import Aggridline from "@/components/aggridline";

export default function Report(){
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "報表" }
    ];
    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        報表
                    </h1>
                    <SelectEnterprise/>

                    <div className="w-4/5 mx-auto mb-6">
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="card bg-base-100 shadow-xl p-6">
                                <h2 className="text-lg font-bold">PSM 達成率</h2>
                                <p className="text-xl font-semibold text-primary">75%</p>
                            </div>
                            <div className="card bg-base-100 shadow-xl p-6">
                                <h2 className="text-lg font-bold">EP 達成率</h2>
                                <p className="text-xl font-semibold text-primary">50%</p>
                            </div>
                            <div className="card bg-base-100 shadow-xl p-6">
                                <h2 className="text-lg font-bold">FR 達成率</h2>
                                <p className="text-xl font-semibold text-primary">90%</p>
                            </div>
                            <div className="card bg-base-100 shadow-xl p-6">
                                <h2 className="text-lg font-bold">ECO 達成率</h2>
                                <p className="text-xl font-semibold text-primary">65%</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <div className="grid grid-cols-1 gap-4 w-11/12 max-w-screen-2xl">
                            <div className="card bg-base-100 shadow-xl p-6 w-full h-[550px]">
                                <Aggridchart/>
                            </div>
                            <div className="card bg-base-100 shadow-xl p-6 w-full h-[550px]">
                                <Aggridline/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
