import axios from "axios";
import { storeAuthTokens, clearAuthCookies } from "@/services/serverAuthService";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
    baseURL: "/proxy",
    withCredentials: true, // ✅ 關鍵：讓 refreshToken (HttpOnly cookie) 自動附帶
    headers: {
        "Content-Type": "application/json"
    }
});

// Request 攔截器（可以加 access token）
api.interceptors.request.use((config) => {
    const token = getAccessTokenFromCookie();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response 攔截器：自動 refresh
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err.response?.status === 401) {
            try {
                const refreshRes = await axios.post("/proxy/Auth/RefreshToken", null, {
                    withCredentials: true
                });

                const newAccessToken = refreshRes.data.accessToken;
                await storeAuthTokens(newAccessToken);

                // 重送原本 request
                err.config.headers.Authorization = `Bearer ${newAccessToken}`;
                return api.request(err.config);
            } catch (e) {
                await clearAuthCookies();
            }
        }
        return Promise.reject(err);
    }
);

function getAccessTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function getPermissionsFromAccessToken(): string[] {
    const token = getAccessTokenFromCookie();
    if (!token) return [];

    try {
        const decoded = jwtDecode<{ permission?: string[] }>(token);
        return decoded.permission || [];
    } catch (err) {
        console.warn("JWT decode failed", err);
        return [];
    }
}

export default api;