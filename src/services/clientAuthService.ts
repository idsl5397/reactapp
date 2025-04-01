// services/Auth/clientAuthService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import getAuthtoken, {
  clearAuthCookies,
  isAuthenticated as serverIsAuthenticated, storeAuthTokens,
} from './serverAuthService';
import {useGlobalStore} from "@/Stores/useGlobalStore";


interface JWTPayload {
  role?: string | string[];
  sub: string;
  exp: number;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  iat: number;
  nbf: number;
  jti: string;
  unique_name?: string;
}

// API 客戶端
const api = axios.create({
  baseURL: '/proxy'
});



// 請求攔截器
api.interceptors.request.use(async (config) => {
  // 從 server-side cookies 獲取 token
  const isServerSide = typeof window === 'undefined';
  if (isServerSide) {
    // 伺服器端直接透過 server 方法獲取
    const authenticated = await serverIsAuthenticated();
    if (authenticated) {
      // 可以在這裡添加從 server cookies 讀取 token 的邏輯
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthCookies();

    }
    return Promise.reject(error);
  }
);

export async function isAuthenticated(): Promise<boolean> {
  // 客戶端檢查
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Use validateToken instead of directly calling serverIsAuthenticated
    const tokenValidation = await validateToken();
    return tokenValidation.isValid;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}




export async function SendVerificationEmail(email: string): Promise<{ success: boolean; message: string ;errors?: string[] }> {
  try {
    const response = await api.post('/Auth/SendVerificationEmail', {Email: email},{
            headers: { 'Content-Type': 'application/json' }
    });
    console.debug(response);
    if (response.status === 200) {
      return { success: true, message: response.data.Message };
    }
    else {
      return { success: false, message: response.data.Message };
    }
  }catch(error) {
    if (axios.isAxiosError(error) && error.response) {
      return {success: false, message: "錯誤" ,errors: error.response?.data?.errors};
    }
    return { success: false, message: "未知錯誤" };
  }
}

export async function VerifyEmailCode(email: string,code:string): Promise<{ success: boolean; message: string ; }> {
  try {
    const response = await api.post('/Auth/VerifyEmailCode', {Email: email,Code:code},{
            headers: { 'Content-Type': 'application/json' }
    });
    console.debug(response);
    if (response.status === 200 && response.data.success) {
      return { success: true, message: response.data.Message };
    }
    else {
      return { success: false, message: response.data.Message };
    }
  }catch(error) {
    console.debug(error);
    return { success: false, message: "功能錯誤" };
  }
}
export async function SignUp(username: string,nickname:string,password:string,email:string): Promise<{ success: boolean; message: string ; }> {
  try {
    const response = await api.post('/Auth/SignUp', {userName:username,password:password,nickName:nickname,email:email},{
            headers: { 'Content-Type': 'application/json' }
    });
    console.debug(response);
    if (response.status === 200 && response.data.success) {
      return { success: true, message: response.data.Message };
    }
    else {
      return { success: false, message: response.data.Message };
    }
  }catch(error) {
    console.debug(error);
    return { success: false, message: "功能錯誤" };
  }
}


export async function DomainQuery(email: string): Promise<{ success: boolean; message: string ;data?:{org: string; type: string[] } }> {
  try {
    const response = await axios.post('/proxy/Auth/DomainQuery', { Email: email }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 200 && response.data.success) {
      return { success: true, message: "此郵件域名已通過組織驗證", data: response.data };
    }
    return { success: false, message: response.data.message ?? "查詢失敗，請稍後再試" };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ API 錯誤回應:", error.response.data);

      if (error.response.status === 403) {
        return { success: false, message: "此郵件域名尚未通過組織驗證" };
      }
    }
    return { success: false, message: "無法驗證電子郵件域名，請稍後再試" };
  }
}




export async function validateToken(): Promise<{isValid:boolean}> {
  try {
    const token = await getAuthtoken();
    // 如果沒有 token，直接返回未驗證
    if (!token) {
      return {
        isValid: false,
      };
    }


    return {
      isValid: true,

    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        isValid: false,
      };
    }
    return {
      isValid: false,
    };
  }
}



export async function logout() {
  await clearAuthCookies();
}
