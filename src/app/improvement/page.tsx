'use client';
import React from 'react';
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectEnterprise from "@/components/selectEnterprise";

export default function improvement(){

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "改善報告書" }
    ];

    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col items-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        改善報告書
                    </h1>

                    <SelectEnterprise/>

                    <div className="card bg-base-100 shadow-xl p-6 mx-auto w-4/5 max-w-screen-lg mb-6">
                        <p>上傳檔案</p>
                        <div className="flex items-center justify-center w-full">
                            <label
                                className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {/*<Upload className="w-10 h-10 mb-3 text-gray-400" />*/}
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">點擊上傳</span> 或拖放檔案至此
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                />
                                <div className="absolute inset-0"/>
                            </label>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl p-6 mx-auto w-4/5 max-w-screen-lg mb-6">
                        <p>檢視檔案</p>
                    </div>
                </div>
            </div>
        </>
    );
}
