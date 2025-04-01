import axios, { AxiosError } from "axios";

const api = axios.create({
    baseURL: "/proxy",
    timeout: 10000, // 添加請求超時設置
});

// 定義 API 回應的介面
interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    username?: string;
    email?: string;
}

export const userService = {
    Login: async (usermail: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await api.post<LoginResponse>("/User/login", {
                usermail,
                password,
            });

            // 確保 API 回應的狀態碼是 200，且 success 為 true
            if (response.status === 200) {
                return {
                    success: response.data.success,
                    message: response.data.message,
                    token: response.data.token,
                    username: response.data.username,
                    email: response.data.email,
                };

            } else {
                return {
                    success: false,
                    message: "登入失敗，請確認帳號或密碼",
                };
            }
        } catch (error) {
            console.error("API 請求失敗:", error);

            let errorMessage = "發生未知錯誤";
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || "伺服器未回應";
            } else {
                errorMessage = (error as Error).message;
            }

            return {
                success: false,
                message: errorMessage,
            };
        }
    },
};
