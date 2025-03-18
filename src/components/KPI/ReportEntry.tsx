'use client'
import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from "next/link";


export default function Report(){
    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "建立報告" }
    ];
    // Sample data - this would come from your actual data source
    const userData = {
        name: "王小明",
        lastUploadDate: "2024-11-15",
        status: "completed", // options: "completed", "overdue", "pending"
        nextDeadline: "2025-05-15"
    };

    // Calculate if upload is within the period
    const isWithinPeriod = () => {
        const today = new Date();
        const lastUpload = new Date(userData.lastUploadDate);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        return lastUpload >= sixMonthsAgo;
    };

    const getStatusDetails = () => {
        switch(userData.status) {
            case "completed":
                return {
                    icon: <CheckCircle className="w-8 h-8 text-green-500" />,
                    color: "bg-green-100",
                    textColor: "text-green-800",
                    message: "已按時上傳報告"
                };
            case "overdue":
                return {
                    icon: <XCircle className="w-8 h-8 text-red-500" />,
                    color: "bg-red-100",
                    textColor: "text-red-800",
                    message: "超過期限未上傳"
                };
            case "pending":
                return {
                    icon: <Clock className="w-8 h-8 text-yellow-500" />,
                    color: "bg-yellow-100",
                    textColor: "text-yellow-800",
                    message: "即將到期，等待上傳"
                };
            default:
                return {
                    icon: <Clock className="w-8 h-8 text-gray-500" />,
                    color: "bg-gray-100",
                    textColor: "text-gray-800",
                    message: "狀態未知"
                };
        }
    };

    const status = getStatusDetails();
    const buttonStyle = {
        width: 200,
        height: 60,
        borderRadius: 8,
        fontWeight: 'bold',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    };
    return (
        <>
            <div className="w-full flex justify-start">
                <Breadcrumbs items={breadcrumbItems}/>
            </div>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="space-y-8 w-full mx-auto">
                    <h1 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                        建立報告
                    </h1>

                    {/* Action Buttons */}
                    <div className="mt-8 card bg-base-100 shadow-xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-center">執行操作</h2>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-2">
                            <Link href="/kpi/newKpi">
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    style={{...buttonStyle, backgroundColor: "#4F46E5"}}
                                    className="shadow-md"
                                >
                                    更新/上傳指標項目
                                </motion.button>
                            </Link>

                            <Link href="/suggest/newSuggest">
                                <motion.div
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    style={{...buttonStyle, backgroundColor: "#10B981"}}
                                    className="shadow-md"
                                >
                                    更新/上傳改善建議
                                </motion.div>
                            </Link>

                            <Link href="/improvement">
                                <motion.div
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    style={{...buttonStyle, backgroundColor: "#F59E0B"}}
                                    className="shadow-md"
                                >
                                    上傳改善報告書
                                </motion.div>
                            </Link>
                        </div>
                    </div>

                    {/* Upload Status Card */}
                    <div className="flex justify-center">
                        <div className="mt-8 card bg-base-100 shadow-lg p-6 w-3/4">
                            <div className="flex flex-col items-center">
                                <h2 className="text-xl font-bold mb-4">半年度追蹤狀態</h2>

                                <div className={`flex items-center p-4 rounded-lg w-full ${status.color}`}>
                                    <div className="mr-4">
                                        {status.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${status.textColor}`}>{status.message}</p>
                                        <p className="text-gray-700">上次上傳日期: {userData.lastUploadDate}</p>
                                        <p className="text-gray-700">下次截止日期: {userData.nextDeadline}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}