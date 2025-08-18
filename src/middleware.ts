// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import getAuthtoken from "@/services/serverAuthService";

const PUBLIC_PATHS = [
    "/login",
    "/about",
    "/direction",
    "/register",
    "/api/auth",
    "/_next",
    "/favicon.ico",
    "/proxy",  // 保持這個
    "/api",
    "/api/verify"
];

export async function middleware(req: NextRequest) {
    const token = await getAuthtoken();
    const tokenValue = token?.value || "";
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const rootPath = basePath || "/";

    // 動態去除 basePath，取得純路徑
    const rawPath = req.nextUrl.pathname;
    const cleanedPath = rawPath.replace(/^\/iskpi/, "");

    // 如果是 proxy 路徑，直接放行（讓 rewrite 處理）
    if (cleanedPath.startsWith("/proxy")) {
        return NextResponse.next();
    }

    // 根路徑重定向
    if (req.nextUrl.pathname === rootPath || req.nextUrl.pathname === `${rootPath}/`) {
        return NextResponse.redirect(new URL("/iskpi/login", req.url));
    }

    // 判斷是否是公開路徑
    const isPublicPath =
        PUBLIC_PATHS.some(path => cleanedPath.startsWith(path)) ||
        cleanedPath.match(/\.(svg|png|jpg|jpeg|webp|ico|woff2|xlsx|txt|xml?)$/);

    // Token 驗證邏輯...（保持原有邏輯）
    if (tokenValue && !/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(tokenValue)) {
        const response = NextResponse.redirect(new URL("/iskpi/login", req.url));
        response.cookies.delete("token");
        return response;
    }

    function base64UrlDecode(str: string): string {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        const padding = 4 - (str.length % 4);
        if (padding !== 4) {
            str += '='.repeat(padding);
        }
        return atob(str);
    }

    if (tokenValue) {
        try {
            const payloadBase64 = tokenValue.split(".")[1];
            const payloadJson = base64UrlDecode(payloadBase64); // ⚠️ 用這個取代原本 atob
            const payload = JSON.parse(payloadJson);
            // const payload = JSON.parse(atob(tokenValue.split(".")[1]));
            const expiry = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            if (expiry && now > expiry) {
                const response = NextResponse.redirect(new URL("/iskpi/login", req.url));
                response.cookies.delete("token");
                return response;
            }
        } catch (e) {
            console.error("解析 Token 時發生錯誤：", e);
            const response = NextResponse.redirect(new URL("/iskpi/login", req.url));
            response.cookies.delete("token");
            return response;
        }
    }

    if (!tokenValue && !isPublicPath) {
        return NextResponse.redirect(new URL("/iskpi/login", req.url));
    }

    return NextResponse.next();
}

//使用更寬泛的 matcher
// export const config = {
//     matcher: [
//         '/iskpi/:path*',
//         '/'
//     ]
// };

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;
const MATCH_ROUTES = [
    "/", "/home", "/kpi", "/kpi/newKpi", "/suggest", "/suggest/newSuggest", "/improvement", "/reportEntry", "/report", "/reportEntry/newKpiValue"
];
const matcher = MATCH_ROUTES.map(route => `${BASE_PATH}${route}`);

export const config = {
    matcher
};