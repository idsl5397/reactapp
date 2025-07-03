import React from "react";
import { useStepContext } from "../StepComponse";
import SelectEnterprise from "@/components/select/selectEnterprise";
import { SelectCompany } from "@/components/Suggest/AddSugvalue";

export default function AddSugValueStep1() {
    const { stepData, updateStepData } = useStepContext();

    const handleSelectChange = (name: keyof SelectCompany, value: string | number) => {
        const current = (stepData.SelectCompany as SelectCompany) || {};
        updateStepData({
            SelectCompany: {
                ...current,
                [name]: name === "organizationId" ? Number(value) : value,
            },
        });
    };

    return (
        <div className="card w-full bg-white shadow-md rounded-lg">
            <div className="card-body p-6">
                <div className="mb-4">
                    <SelectEnterprise
                        showYearRange={false}
                        onSelectionChange={(payload) => {
                            handleSelectChange("organizationId", payload.orgId);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}