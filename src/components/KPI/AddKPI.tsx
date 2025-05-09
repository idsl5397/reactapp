'use client';

import React, { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import SingleAddKpiForm from './SingleAddKpiForm';
import BatchUploadKpi from './BatchUploadKpi';
import { Toaster } from 'react-hot-toast';

export default function AddKpiPage() {
    const [mode, setMode] = useState<'single' | 'batch'>('single');

    const breadcrumbItems = [
        { label: '首頁', href: '/' },
        { label: '績效指標', href: '/kpi' },
        { label: '新增績效指標' }
    ];

    return (
        <>
            <Toaster position="top-right" reverseOrder={false}/>
            <Breadcrumbs items={breadcrumbItems}/>

            <div className="mt-8 flex border-b border-gray-200 space-x-8 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
                <button
                    onClick={() => setMode('single')}
                    className={`pb-2 text-sm font-medium border-b-2 transition-colors duration-200 ease-in-out
            ${mode === 'single'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
        `}
                >
                    單筆匯入
                </button>
                <button
                    onClick={() => setMode('batch')}
                    className={`pb-2 text-sm font-medium border-b-2 transition-colors duration-200 ease-in-out
            ${mode === 'batch'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
        `}
                >
                    Excel 批次匯入
                </button>
            </div>

            <div className="mt-6 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-10">
                {mode === 'single' ? <SingleAddKpiForm/> : <BatchUploadKpi/>}
            </div>
        </>
    );
}