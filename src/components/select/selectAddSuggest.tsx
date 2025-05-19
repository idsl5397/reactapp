import React, {useEffect, useState} from "react";
import { IMaskInput } from 'react-imask';
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import dynamic from 'next/dynamic';


const CreatableSelect = dynamic(() => import('react-select/creatable'), {
    ssr: false,
});

const api = axios.create({
    baseURL: '/proxy',
});

interface CommitteeUser {
    id: string;
    nickName: string;
}

interface Option {
    value: string;
    label: string;
}


export interface AddSuggestFormData {
    date: string;
    eventType: string;
    category: string;
    committee: string;
    suggestion: string;
    suggestionType: string;
    department: string;
    isAdopted: string;
    improveDetail: string;
    manpower: number | null;
    budget: number | null;
    isCompleted: string;
    completedOther: string;
    doneYear: string;
    doneMonth: string;
    isParallel: string;
    parallelOther: string;
    execPlan: string;
    remark: string;
}

export default function SelectAddAll() {
    const [formData, setFormData] = useState<AddSuggestFormData>({
        date: '',
        eventType: '',
        category: '',
        committee: '',
        suggestion: '',
        suggestionType: '',
        department: '',
        isAdopted: '',
        improveDetail: '',
        manpower: null,
        budget: null,
        isCompleted: '',
        completedOther: '',
        doneYear: '',
        doneMonth: '',
        isParallel: '',
        parallelOther: '',
        execPlan: '',
        remark: '',
    });

    const handleChange = (field: keyof AddSuggestFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const [committeeOptions, setCommitteeOptions] = useState<Option[]>([]);
    const [isCommitteeLoading, setIsCommitteeLoading] = useState(false);

    useEffect(() => {
        const fetchCommittees = async () => {
            const res = await api.get<CommitteeUser[]>("/Suggest/GetCommitteeUsers"); // 根據你的路由調整
            console.log(res);
            // setCommitteeOptions(res.data);
            const mapped = res.data.map((user) => ({
                value: user.id,
                label: user.nickName,
            }));
            setCommitteeOptions(mapped);
        };
        fetchCommittees();
    }, []);

    const handleCreateCommittee = (inputValue: string) => {
        setIsCommitteeLoading(true);
        setTimeout(() => {
            const newOption = { label: inputValue, value: inputValue }; // value 預設用名稱
            setCommitteeOptions((prev) => [...prev, newOption]);
            handleChange("committee", inputValue); // 如果你只要存 nickname
            setIsCommitteeLoading(false);
        }, 500);
    };
    return (
        <>
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">年月日</label>
                <input type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)}
                       className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">會議/活動</label>
                <select value={formData.eventType} onChange={(e) => handleChange("eventType", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="0">書面審查會議</option>
                    <option value="1">實地進廠查驗</option>
                    <option value="2">領先指標輔導</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">類別</label>
                <select value={formData.category} onChange={(e) => handleChange("category", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="PSM">PSM</option>
                    <option value="EP">EP</option>
                    <option value="FR">FR</option>
                    <option value="ECO">ECO</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">
                    委員（可搜尋或新增）
                </label>
                <CreatableSelect
                    isClearable
                    isDisabled={isCommitteeLoading}
                    isLoading={isCommitteeLoading}
                    options={committeeOptions}
                    value={committeeOptions.find((o) => o.label === formData.committee) || null}
                    onChange={(option: any) => handleChange("committee", option?.label || "")}
                    onCreateOption={handleCreateCommittee}
                    placeholder="請選擇或輸入委員名"
                    className="mt-2"
                />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">建議</label>
                <textarea
                    placeholder="請輸入建議"
                    value={formData.suggestion}
                    onChange={(e) => handleChange("suggestion", e.target.value)}
                    rows={3}
                    className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 resize-y"
                />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">建議類別</label>
                <select value={formData.suggestionType} onChange={(e) => handleChange("suggestionType", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇建議類別</option>
                    <option value="0">改善建議</option>
                    <option value="1">精進建議</option>
                    <option value="2">可資借鏡</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">負責部門</label>
                <input type="text" placeholder="請輸入負責部門" value={formData.department}
                       onChange={(e) => handleChange("department", e.target.value)}
                       className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">是否參採</label>
                <select value={formData.isAdopted} onChange={(e) => handleChange("isAdopted", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                    <option value="2">不參採</option>
                    <option value="3">詳備註</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">改善對策/辦理情形</label>
                <textarea
                    placeholder="請輸入改善對策/辦理情形"
                    value={formData.improveDetail}
                    onChange={(e) => handleChange("improveDetail", e.target.value)}
                    rows={3}
                    className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 resize-y"
                />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">投入人力(人/月)</label>
                <input type="number" placeholder="如沒有請留空" value={formData.manpower ?? ''}
                       onChange={(e) => handleChange("manpower", parseInt(e.target.value) || null)}
                       className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">投入(改善)經費 (元)</label>
                <input type="number" placeholder="如沒有請留空" step="0.01" value={formData.budget ?? ''}
                       onChange={(e) => handleChange("budget", parseFloat(e.target.value) || null)}
                       className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">是否完成改善/辦理</label>
                <select value={formData.isCompleted} onChange={(e) => handleChange("isCompleted", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                    <option value="2">不參採</option>
                    <option value="3">詳備註</option>
                </select>
                {formData.isCompleted === "3" && (
                    <input type="text" placeholder="請輸入補充" value={formData.completedOther}
                           onChange={(e) => handleChange("completedOther", e.target.value)}
                           className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
                )}
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">預計完成年份</label>
                <IMaskInput mask="000" placeholder="例如: 113" value={formData.doneYear}
                            onAccept={(val) => handleChange("doneYear", val)}
                            className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">預計完成月份</label>
                <IMaskInput mask="00" placeholder="例如: 07" value={formData.doneMonth}
                            onAccept={(val) => handleChange("doneMonth", val)}
                            className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">是否平行展開推動執行</label>
                <select value={formData.isParallel} onChange={(e) => handleChange("isParallel", e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 custom-select">
                    <option value="">請選擇</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                    <option value="2">不參採</option>
                    <option value="3">詳備註</option>
                </select>
                {formData.isParallel === "3" && (
                    <input type="text" placeholder="請輸入補充" value={formData.parallelOther}
                           onChange={(e) => handleChange("parallelOther", e.target.value)}
                           className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"/>
                )}
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">平行展開推動執行規劃</label>
                <input type="text" placeholder="請輸入執行規劃" value={formData.execPlan}
                       onChange={(e) => handleChange("execPlan", e.target.value)}
                       className="w-full border border-gray-300 rounded-md px-3 py-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900">備註</label>
                <input type="text" placeholder="請輸入備註" value={formData.remark}
                       onChange={(e) => handleChange("remark", e.target.value)}
                       className="w-full border border-gray-300 rounded-md px-3 py-2"/>
            </div>
        </>
    );
}
