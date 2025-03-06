// 創建axios實例
import axios from "axios";

const api = axios.create({
    baseURL: '/proxy', //  timeout: 10000  // 添加請求超時設置
});


export const enterpriseService = {
    fetchData : async () => {
        try {
            const response = await api.get('/Enterprise/GetEnterprise');
            return response.data;
        } catch (error) {
            console.error("API 請求失敗:", error);
            return null;
        }
    }
}