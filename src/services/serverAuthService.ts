"use server";
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { NextRequest } from 'next/server';

interface JWTPayload {
  role?: string | string[];
  sub: string;
  exp: number;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  iat: number;
  nbf: number;
  jti: string;
}
/**
 * 清除認證 Cookies
 */
export async function clearAuthCookies() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    cookieStore.delete("refresh_token");

  } catch (error) {
    console.error("清除認證 Cookies 時發生錯誤:", error);
  }
}


export default async function getAuthtoken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) {
    return null;
  }
  else {
    return token;
  }
}
export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token') ?? null;
}


export async function getUserInfo() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) {
    return null;
  }
  try {
    // 解析 Access Token
    const decodedAccess = jwtDecode<JWTPayload>(token.value);
    const id = decodedAccess["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "";
    const nickName = decodedAccess["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "未提供名稱";
    return {
      NickName: nickName,
      UserId: id,
    }
  }catch (error) {
    if (error!=undefined) {
      throw new Error(String(error));
    }

  }

}
export  async function getrefreshToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('refresh_token');
  if (!token) {
    return null;
  }
  else {
    return token;
  }
}

/**
 * 存儲 Access Token 和 Refresh Token 到 Cookies
 * @param accessToken JWT 的 Access Token
 * @param refreshToken JWT 的 Refresh Token
 * @returns 用戶基本信息 (userName, roles, userId)
 */
export async function storeAuthTokens(accessToken: string, refreshToken: string) {
  if (!accessToken || !refreshToken) {
    throw new Error('未提供 AccessToken 或 RefreshToken');
  }

  try {
    // 解析 Access Token
    const decodedAccess = jwtDecode<JWTPayload>(accessToken);
    console.log("解析 Access Token: ",decodedAccess);
    // 計算 Access Token 過期時間
    const accessExpiration = new Date(decodedAccess.exp * 1000);
    const cookieStore = await cookies();

    // 存儲 Access Token
    cookieStore.set('token', accessToken, {
      expires: accessExpiration,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    // 存儲 Refresh Token，過期時間設置為 7 天
    const refreshExpiration = new Date();
    refreshExpiration.setDate(refreshExpiration.getDate() + 7);

    cookieStore.set('refresh_token', refreshToken, {
      expires: refreshExpiration,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    // 解析 userName
    let userName = decodedAccess["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "未提供名稱";

    // 移除不可見字符並清理空格
    userName = userName.normalize("NFKC")
                      .replace(/[\u200B-\u200D\uFEFF\u00A0\ufffc]/g, "")
                      .trim()
                      .replace(/\s+/g, " "); // 轉換多個空格為單一空格

    // 解析 UserId
    const userId = decodedAccess.sub || "未知";

    // 解析角色
    // let roles: string[] = [];
    // if (decodedAccess["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) {
    //   const roleData = decodedAccess["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    //   roles = Array.isArray(roleData) ? roleData : [roleData];
    // } else if (decodedAccess.role) {
    //   roles = Array.isArray(decodedAccess.role) ? decodedAccess.role : [decodedAccess.role];
    // }

    return {
      userName,
      // roles,
      userId,
    };
  } catch (error) {
    console.error('存儲 Token 時發生錯誤:', error);
    throw error;
  }
}




export async function isAuthenticated(req?: NextRequest): Promise<boolean> {
  let token: string | undefined;

  // 如果提供了 request 对象 (middleware)，从 request cookies 获取 token
  if (req) {
    token = req.cookies.get('token')?.value;
  } else {
    // 否则使用 Next.js cookies API (在 Server Components 中)
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value;
    } catch (error) {
      console.error('获取 cookie 时出错:', error);
      return false;
    }
  }

  if (!token) return false;

  try {
    // 解析 token 并检查是否过期
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);

    // 如果 token 已过期，返回 false
    return !(decoded.exp && decoded.exp < currentTime);
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
}
/**
 * 為了完整性，從 token 中獲取用戶角色
 * @param req - NextRequest 對象 (middleware 使用)
 * @returns 用戶角色列表，如果無法獲取則返回空數組
 */
export async function getUserRoles(req?: NextRequest): Promise<string[]> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get('token')?.value;
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value;
    } catch (error) {
      console.error('獲取 cookie 時出錯:', error);
      return [];
    }
  }

  if (!token) return [];

  try {
    const decoded = jwtDecode<JWTPayload>(token);

    let roles: string[] = [];

    if (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
      const roleData = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (Array.isArray(roleData)) {
        roles = roleData;
      } else if (typeof roleData === 'string') {
        roles = [roleData];
      }
    } else if (decoded.role) {
      if (Array.isArray(decoded.role)) {
        roles = decoded.role;
      } else {
        roles = [decoded.role];
      }
    }

    return roles;
  } catch (error) {
    console.error('解析 token 時出錯:', error);
    return [];
  }
}
