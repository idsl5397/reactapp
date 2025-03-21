import {ChevronDownIcon} from "@heroicons/react/16/solid";
import React, {useState} from "react";
import "react-datepicker/dist/react-datepicker.css";

export default function SelectAddAll() {
    const [selectedOption, setSelectedOption] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedOption(value);
        setShowInput(value === '其他');
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // 允許用戶輸入空值、"-" 或數字
        if (value === "" || value === "-" || /^[0-9]*$/.test(value)) {
            setInputValue(value);
        }
    };

    return (
        <>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-900">
                    年月日
                </label>
                <div className="mt-2 grid grid-cols-1">
                    <input
                        type="date"
                        id="date"
                        name="date"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        onChange={(e) => {
                            const selectedDate = e.target.value;
                            console.log("選擇的日期是:", selectedDate); // 這裡你可以將選擇的日期處理成需要的格式或做其他操作
                        }}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="factory" className="block text-sm/6 font-medium text-gray-900">
                    會議/活動
                </label>
                <div className="mt-2 grid grid-cols-1">
                    <select
                        id="year"
                        name="year"
                        autoComplete="year-name"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                    >
                        <option value="">請選擇</option>
                        <option value="0">書面審查會議</option>
                        <option value="1">實地進廠查驗</option>
                        <option value="2">領先指標輔導</option>

                    </select>
                    <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="company" className="block text-sm/6 font-medium text-gray-900">
                    類別
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
                <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                    委員
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入委員"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                    建議
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入建議"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                    建議類別
                </label>
                <div className="mt-2 grid grid-cols-1">
                    <select
                        id="year"
                        name="year"
                        autoComplete="year-name"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                    >
                        <option value="">請選擇建議類別</option>
                        <option value="0">改善建議</option>
                        <option value="1">精進建議</option>
                        <option value="2">可資借鏡</option>

                    </select>
                    <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                    負責部門
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入負責部門"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="year" className="block text-sm/6 font-medium text-gray-900">
                    是否參採
                </label>
                <div className="mt-2 grid grid-cols-1">
                    <select
                        id="year"
                        name="year"
                        autoComplete="year-name"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 custom-select"
                    >
                        <option value="">請選擇</option>
                        <option value="是">是</option>
                        <option value="否">否</option>

                    </select>
                    <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="quarter" className="block text-sm/6 font-medium text-gray-900">
                    改善對策/辦理情形
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入辦理情形"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="enterprise" className="block text-sm/6 font-medium text-gray-900">
                    投入人力(人/月)
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
                <label htmlFor="enterprise" className="block text-sm/6 font-medium text-gray-900">
                    投入(改善)經費 (-/元)
                </label>
                <div className="mt-2 flex items-center">
                    <input
                        type="text"  // 使用 text 來允許輸入字母與數字
                        placeholder="請輸入數值"
                        value={inputValue}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <span className="ml-2 text-gray-600">元</span>
                </div>
            </div>
            <div>
                <label htmlFor="factory" className="block text-sm/6 font-medium text-gray-900">
                    是否完成改善/辦理
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
                        <option value="是">是</option>
                        <option value="否">否</option>
                        <option value="不參採">不參採</option>
                        <option value="其他">詳備註</option>
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
                            placeholder="請輸入"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="quarter" className="block text-sm/6 font-medium text-gray-900">
                    預計完成日期
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入預計完成日期"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="factory" className="block text-sm/6 font-medium text-gray-900">
                    是否平行展開推動執行
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
                        <option value="是">是</option>
                        <option value="否">否</option>
                        <option value="不參採">不參採</option>
                        <option value="其他">詳備註</option>
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
                            placeholder="請輸入"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="quarter" className="block text-sm/6 font-medium text-gray-900">
                    平行展開推動執行規劃
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="請輸入執行規劃"
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
