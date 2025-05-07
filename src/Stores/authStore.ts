// store/useGlobalStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import {isAuthenticated} from "@/services/clientAuthService";
import {authService} from "@/services/authService";
import {getAccessToken, clearAuthCookies} from "@/services/serverAuthService";

interface JWTPayload {
    sub: string;
    exp: number;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
}

interface GlobalState {
    isLoggedIn: boolean;
    userName: string | null;
    setIsLoggedIn: (status: boolean) => void;
    setUserName: (name: string | null) => void;
    theme: boolean;
    checkIsLoggedIn: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useauthStore = create<GlobalState>()(
    persist(
        (set, get) => ({
            isLoggedIn: false,
            userName: null,
            theme: false,

            // ✅ 客戶端檢查登入狀態
            checkIsLoggedIn: async () => {
                try {
                    const authStatus = await isAuthenticated();
                    set({ isLoggedIn: authStatus });
                } catch (error) {
                    console.error('Authentication check failed:', error);
                    set({ isLoggedIn: false, userName: null });
                }
            },

            // ✅ 伺服器端檢查登入狀態，並解析 Token 取得 userId
            checkAuthStatus: async () => {
                try {
                    const token = await getAccessToken();
                    if (!token) {
                        set({ isLoggedIn: false, userName: null });
                        return;
                    }

                    const decoded = jwtDecode<JWTPayload>(token.value);
                    set({
                        isLoggedIn: true,
                        userName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                    });
                } catch (error) {
                    console.error('Server-side auth check failed:', error);
                    set({ isLoggedIn: false, userName: null });
                }
            },

            setIsLoggedIn: (status) => set({ isLoggedIn: status }),
            setUserName: (name) => set({ userName: name }),

            // ✅ 登出時清除 auth_token 並重置 userId
            logout: async () => {
                await authService.logout();
                await clearAuthCookies();
                set({ isLoggedIn: false, userName: null });
            },

        }),
        {
            name: 'global-storage',
        }
    )
);