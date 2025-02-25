// types/Selector/enterPrise.ts

/**
 * 企業集團介面
 * 代表最高層級的企業實體（控股公司/集團企業）
 */
export interface EnterPrise {
    /** 企業唯一識別碼 */
    id: string;
    /** 企業名稱 */
    name: string;
    /** 該企業下的所有子公司 */
    child: Company[];
    // 可擴展欄位
    // establishedYear?: number;  // 成立年份
    // industryType?: string;    // 產業類型
    // stockCode?: string;       // 股票代碼
}

/**
 * 公司介面
 * 代表企業集團下的子公司
 */
export interface Company {
    /** 公司唯一識別碼 */
    id: string;
    /** 公司名稱 */
    name: string;
    /** 該公司下的所有工廠 */
    child: Factory[];
    // 可擴展欄位
    // parentId?: string;       // 母公司ID
    // registeredCapital?: number; // 註冊資本
    // location?: string;       // 公司所在地
}

/**
 * 工廠介面
 * 代表公司下的生產工廠
 */
export interface Factory {
    /** 工廠唯一識別碼 */
    id: string;
    /** 工廠名稱 */
    name: string;
    // 未來可擴展的欄位
    // companyId?: string;      // 所屬公司ID
    // address?: string;        // 工廠地址
    // employeeCount?: number;  // 員工數量
    // productionLines?: string[]; // 生產線
}
export interface EnterPriseForm {
    enterpriseId: string;
    companyId: string;
    factoryId: string;

}
