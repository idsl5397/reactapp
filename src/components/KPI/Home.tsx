'use client';
import React from 'react';
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise from "@/components/select/selectEnterprise";
import Aggridchart from "@/components/aggridchart";
import Aggridline from "@/components/aggridline";


export default function Home(){
    const breadcrumbItems = [
        { label: "首頁"},
    ];


    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl sm:text-3xl leading-8 sm:leading-9 font-bold tracking-tight text-gray-900">
                        首頁
                    </h1>
                    <div className="card bg-base-100 shadow-xl p-6 mr-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <SelectEnterprise/>
                        </div>
                    </div>
                    <div className="w-4/5 mx-auto mb-6">
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="card bg-base-100 shadow-xl p-6">
                                <h2 className="text-lg font-bold">製程安全管理(PSM) 改善完成率</h2>
                                <p className="text-xl font-semibold text-primary">75%</p>
                            </div>
                            <div className="card bg-base-100 shadow-xl p-6">
                                <h2 className="text-lg font-bold">環保管理(EP) 改善完成率</h2>
                                <p className="text-xl font-semibold text-primary">50%</p>
                            </div>
                            <div className="card bg-base-100 shadow-xl p-6">
                                <h2 className="text-lg font-bold">消防管理(FR) 改善完成率</h2>
                                <p className="text-xl font-semibold text-primary">90%</p>
                            </div>
                            <div className="card bg-base-100 shadow-xl p-6">
                                <h2 className="text-lg font-bold">能源管理(ECO) 改善完成率</h2>
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
