// services/enterpriseService.ts
import axios from "axios";
import { getCookie } from "@/services/serverAuthService";

const api = axios.create({
    baseURL: "/proxy",
});

export const enterpriseService = {
    fetchData: async () => {
        try {
            const token = await getCookie(); // 取得 Cookie
            if (token) {
                const response = await api.get("/Enterprise/GetEnterprise", {
                    headers: {
                        Authorization: `Bearer ${token.value}`, // 使用 Bearer Token
                    },
                });
                return response.data;
            }


        } catch (error) {
            console.error("API 請求失敗:", error);
            return null;
        }
    },
};
