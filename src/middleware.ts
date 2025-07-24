import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 明確定義 publicPaths，**不帶 basePath**
const PUBLIC_PATHS = [
    "/login",
    "/about",
    "/direction",
    "/register",
    "/api/auth",
    "/_next",
    "/favicon.ico",
    "/proxy"
];

// ✅ Middleware 主體
export function middleware(req: NextRequest) {
    const token = req.cookies.get("token");
    const tokenValue = token?.value || "";

    // 動態去除 basePath（ex: /iskpi），取得純路徑
    const rawPath = req.nextUrl.pathname;
    const cleanedPath = rawPath.replace(/^\/iskpi/, "");

    // 判斷是否是公開路徑
    const isPublicPath =
        PUBLIC_PATHS.some(path => cleanedPath.startsWith(path)) ||
        cleanedPath.match(/\.(svg|png|jpg|jpeg|webp|ico|woff2|xlsx|txt|xml?)$/);

    // ✅ 無效 token 格式（非 JWT）
    if (tokenValue && !/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(tokenValue)) {
        const response = NextResponse.redirect(new URL("/iskpi/login", req.url));
        response.cookies.delete("token");
        return response;
    }

    // ✅ 檢查 token 是否過期
    if (tokenValue) {
        try {
            const payload = JSON.parse(atob(tokenValue.split(".")[1]));
            const expiry = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            if (expiry && now > expiry) {
                const response = NextResponse.redirect(new URL("/iskpi/login", req.url));
                response.cookies.delete("token");
                return response;
            }
        } catch (e) {
            const response = NextResponse.redirect(new URL("/iskpi/login", req.url));
            response.cookies.delete("token");
            return response;
        }
    }

    // ✅ 若沒有登入，且不是公開路徑，導向登入
    if (!tokenValue && !isPublicPath) {
        return NextResponse.redirect(new URL("/iskpi/login", req.url));
    }

    // ✅ 設定安全標頭
    const headers = new Headers(req.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("X-XSS-Protection", "1; mode=block");
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Robots-Tag", "noindex,nofollow, noarchive, nosnippet, notranslate, noimageindex");

    return NextResponse.next({ request: { headers } });
}

// ✅ 僅攔指定路徑
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;
const MATCH_ROUTES = [
    "/", "/home", "/kpi", "/kpi/newKpi", "/suggest", "/suggest/newSuggest", "/improvement", "/reportEntry", "/report"
];
const matcher = MATCH_ROUTES.map(route => `${BASE_PATH}${route}`);

export const config = {
    matcher
};