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
    "/proxy",
    "/api",
    "/api/verify"
];

export async function middleware(req: NextRequest) {
    // 🔧 修復：添加調試日志
    console.log("🔍 Middleware 執行:", {
        pathname: req.nextUrl.pathname,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH,
        nodeEnv: process.env.NODE_ENV,
        url: req.url
    });

    const token = await getAuthtoken();
    const tokenValue = token?.value || "";

    // 🔧 修復：更robust的basePath處理
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const rootPath = basePath || "/";

    console.log("🎯 Token檢查:", { hasToken: !!tokenValue });

    // 動態去除 basePath，取得純路徑
    const rawPath = req.nextUrl.pathname;

    // 🔧 修復：更靈活的路徑清理
    let cleanedPath = rawPath;
    if (basePath && rawPath.startsWith(basePath)) {
        cleanedPath = rawPath.substring(basePath.length);
    }
    // 如果還是以 /iskpi 開頭，再次清理
    if (cleanedPath.startsWith("/iskpi")) {
        cleanedPath = cleanedPath.replace(/^\/iskpi/, "");
    }

    console.log("📍 路徑處理:", { rawPath, cleanedPath, basePath });

    // 如果是 proxy 路徑，直接放行
    if (cleanedPath.startsWith("/proxy")) {
        console.log("🚀 Proxy路徑放行");
        return NextResponse.next();
    }

    // 根路徑重定向
    if (req.nextUrl.pathname === rootPath || req.nextUrl.pathname === `${rootPath}/`) {
        console.log("🏠 根路徑重定向到登入");
        return NextResponse.redirect(new URL(`${basePath}/login`, req.url));
    }

    // 判斷是否是公開路徑
    const isPublicPath =
        PUBLIC_PATHS.some(path => cleanedPath.startsWith(path)) ||
        cleanedPath.match(/\.(svg|png|jpg|jpeg|webp|ico|woff2|xlsx|txt|xml?)$/);

    console.log("🔓 公開路徑檢查:", { cleanedPath, isPublicPath });

    // Token 格式驗證
    if (tokenValue && !/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(tokenValue)) {
        console.log("❌ Token格式無效，重定向到登入");
        const response = NextResponse.redirect(new URL(`${basePath}/login`, req.url));
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

    // Token 到期檢查
    if (tokenValue) {
        try {
            const payloadBase64 = tokenValue.split(".")[1];
            const payloadJson = base64UrlDecode(payloadBase64);
            const payload = JSON.parse(payloadJson);
            const expiry = payload.exp;
            const now = Math.floor(Date.now() / 1000);

            console.log("⏰ Token到期檢查:", { expiry, now, expired: expiry && now > expiry });

            if (expiry && now > expiry) {
                console.log("⏰ Token已過期，重定向到登入");
                const response = NextResponse.redirect(new URL(`${basePath}/login`, req.url));
                response.cookies.delete("token");
                return response;
            }
        } catch (e) {
            console.error("❌ 解析Token錯誤:", e);
            const response = NextResponse.redirect(new URL(`${basePath}/login`, req.url));
            response.cookies.delete("token");
            return response;
        }
    }

    // 🔧 修復：最終權限檢查
    if (!tokenValue && !isPublicPath) {
        console.log("🚫 無Token且非公開路徑，重定向到登入");
        return NextResponse.redirect(new URL(`${basePath}/login`, req.url));
    }

    console.log("✅ Middleware檢查通過，繼續執行");
    return NextResponse.next();
}

// 🔧 修復：簡化matcher配置
export const config = {
    matcher: [
        // 排除靜態資源和API路徑，匹配所有其他路徑
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)',
    ],
};