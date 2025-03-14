import {ChevronDownIcon} from "@heroicons/react/16/solid";
import React, {useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function SelectAddAll() {
    const [selectedOption, setSelectedOption] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedOption(value);
        setShowInput(value === '其他');
    };

    return (
        <>
            <div>
                <label htmlFor="enterprise" className="block text-sm/6 font-medium text-gray-900">
                    指標
                </label>
                <div className="mt-2 grid grid-cols-1">
                    <select
                        id="year"
                        name="year"
                        autoComplete="year-name"
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
            <div>
                <label htmlFor="company" className="block text-sm/6 font-medium text-gray-900">
                    領域
                </label>
                <div className="mt-2 grid grid-cols-1">
                    <select
                        id="year"
                        name="year"
                        autoComplete="year-name"
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
            <div>
                <label htmlFor="factory" className="block text-sm/6 font-medium text-gray-900">
                    指標項目
                </label>
                <div className="mt-2 grid grid-cols-1">
                    <select
                        id="year"
                        name="year"
                        autoComplete="year-name"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                        value={selectedOption}
                        onChange={handleSelectChange}
                    >
                        <option value="">請選擇</option>
                        <option value="既有的">既有的</option>
                        <option value="其他">其他</option>
                    </select>
                    <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    />
                </div>

                {showInput && (
                    <div className="mt-2">
                        <input
                            type="text"
                            placeholder="請輸入其他選項"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                    指標細項
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入指標細項"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                    單位
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入單位"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="enterprise" className="block text-sm/6 font-medium text-gray-900">
                    基線值數據年限(僅填數值)
                </label>
                <div className="mt-2">
                    <input
                        type="number"
                        placeholder="請輸入數值"
                        step="1" // 限制只能輸入整數
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="company" className="block text-sm/6 font-medium text-gray-900">
                    基線值(僅填數值)
                </label>
                <div className="mt-2">
                    <input
                        type="number"
                        placeholder="請輸入數值"
                        step="1" // 限制只能輸入整數
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                    年份
                </label>
                <div className="mt-2 grid grid-cols-1">
                    <select
                        id="year"
                        name="year"
                        autoComplete="year-name"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                    >
                        <option value="">請選擇年份</option>
                        <option value="110">110</option>
                        <option value="111">111</option>
                        <option value="112">112</option>
                        <option value="113">113</option>

                    </select>
                    <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="quarter" className="block text-sm/6 font-medium text-gray-900">
                    該年份執行現況(僅填數值)
                </label>
                <div className="mt-2">
                    <input
                        type="number"
                        placeholder="請輸入數值"
                        step="1" // 限制只能輸入整數
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="quarter" className="block text-sm/6 font-medium text-gray-900">
                    目標值(僅填數值)
                </label>
                <div className="mt-2">
                    <input
                        type="number"
                        placeholder="請輸入數值"
                        step="1" // 限制只能輸入整數
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="quarter" className="block text-sm/6 font-medium text-gray-900">
                    備註
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入備註"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
        </>
    )
}
