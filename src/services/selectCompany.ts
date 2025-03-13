// 創建axios實例
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: '/proxy', //  timeout: 10000  // 添加請求超時設置
});

const token = Cookies.get('token');
export const enterpriseService = {
    fetchData : async () => {
        try {
            const response = await api.get('/Enterprise/GetEnterprise',{
                headers: {
                    'Authorization': `Bearer ${token}` // 使用 Bearer Token
                }
            });
            return response.data;
        } catch (error) {
            console.error("API 請求失敗:", error);
            return null;
        }
    }
}