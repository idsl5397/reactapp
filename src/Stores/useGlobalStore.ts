// store/useGlobalStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isAuthenticated } from '@/services/clientAuthService';
import { getAccessToken, clearAuthCookies } from '@/services/serverAuthService';
import { authService } from "@/services/authService";
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    sub: string;
    exp: number;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
}

interface GlobalState {
    isLoggedIn: boolean;
    userId: string | null;
    userName: string | null;
    setIsLoggedIn: (status: boolean) => void;
    setUserId: (id: string | null) => void;
    setUserName: (name: string | null) => void;
    theme: boolean;
    checkIsLoggedIn: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    logout: () => Promise<void>;
    toggleTheme: () => void;
}

export const useGlobalStore = create<GlobalState>()(
    persist(
        (set, get) => ({
            isLoggedIn: false,
            userId: null,
            userName: null,
            theme: false,

            // ✅ 客戶端檢查登入狀態
            checkIsLoggedIn: async () => {
                try {
                    const authStatus = await isAuthenticated();
                    set({ isLoggedIn: authStatus });
                } catch (error) {
                    console.error('Authentication check failed:', error);
                    set({ isLoggedIn: false, userId: null, userName: null });
                }
            },

            // ✅ 伺服器端檢查登入狀態，並解析 Token 取得 `userId`
            checkAuthStatus: async () => {
                try {
                    const token = await getAccessToken();
                    if (!token) {
                        set({ isLoggedIn: false, userId: null, userName: null });
                        return;
                    }

                    const decoded = jwtDecode<JWTPayload>(token.value);
                    set({
                        isLoggedIn: true,
                        userId: decoded.sub, // 設定 UserId
                        userName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                    });
                } catch (error) {
                    console.error('Server-side auth check failed:', error);
                    set({ isLoggedIn: false, userId: null, userName: null });
                }
            },

            setIsLoggedIn: (status) => set({ isLoggedIn: status }),
            setUserId: (id) => set({ userId: id }),
            setUserName: (name) => set({ userName: name }),

            // ✅ 登出時清除 `auth_token` 並重置 `userId`
            logout: async () => {
                await authService.logout();
                await clearAuthCookies();
                set({ isLoggedIn: false, userId: null, userName: null });
            },

            toggleTheme: () => set((state) => ({ theme: !state.theme })),
        }),
        {
            name: 'global-storage',
        }
    )
);