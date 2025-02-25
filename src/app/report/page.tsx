'use client'
import Aggrid from "@/components/aggrid";
import Aggridchart from "@/components/aggridchart";
import React from "react";

export default function page(){

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                新增帳號
            </h1>
            <div className="space-y-12">
                <div className="card bg-base-100 shadow-xl p-6">
                    <Aggrid/>
                    <Aggridchart/>
                </div>
            </div>
        </div>
            )
            }