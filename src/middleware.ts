import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const PUBLIC_PATHS = ['/login', '/api/auth', '/_next', '/favicon.ico'];

/**
 * 中介軟體（Middleware）
 *
 * 用於檢查使用者是否已登入，若未登入則導向登入頁。
 *
 * @param {NextRequest} req - 伺服器請求物件。
 * @returns {NextResponse} 若使用者未登入則重導至登入頁，否則繼續處理請求。
 */
export function middleware(req: NextRequest) {
    const token = req.cookies.get('token');
    const isPublicPath = PUBLIC_PATHS.some(path =>
        req.nextUrl.pathname.startsWith(path)
    );

    // 防止 token 為 undefined
    const tokenValue = token?.value || "";

    // const isLoginPage = req.nextUrl.pathname === "/login";
    // if (!token && !isLoginPage) {
    //     return NextResponse.redirect(new URL("/login", req.url));
    // }

    // Token 格式验证（示例：JWT 格式）
    if (tokenValue && !/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(tokenValue)) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.set("token", "", {
            path: "/",
            expires: new Date(0),
        });
        return response;
    }

    // 未登入且訪問非公開頁面，導向 login
    if (!tokenValue && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const headers = new Headers(req.headers);
    // 設定安全標頭
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('X-Robots-Tag', "noindex,nofollow, noarchive, nosnippet, notranslate, noimageindex");


    const res = NextResponse.next({
        request: { headers }
    });

    return res;
}

/**
 * 設定要攔截的路由。
 * 僅適用於指定的路由，確保這些頁面需要登入驗證。
 */
export const config = {
    matcher: ["/", "/home", "/kpi", "/kpi/newKpi", "/suggest", "/suggest/newSuggest", "/improvement", "/reportEntry", "/report", "/register"],
};

