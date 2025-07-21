import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const basePath = process.env.BASE_PATH || "";
const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const PUBLIC_PATHS =
    ['/login',
        '/api/auth',
        '/_next',
        NPbasePath+'/favicon.ico',
        '/proxy'
    ];

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

        || req.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|webp|ico|woff2|xlsx|txt|xml?)$/)
    );

    // 防止 token 為 undefined
    const tokenValue = token?.value || "";

    // const isLoginPage = req.nextUrl.pathname === "/login";
    // if (!token && !isLoginPage) {
    //     return NextResponse.redirect(new URL("/login", req.url));
    // }

    // Token 格式验证（示例：JWT 格式）
    if (tokenValue && !/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(tokenValue)) {
        const response = NextResponse.redirect(new URL(basePath+"/login", req.url));
        response.cookies.delete("token");
        return response;
    }

    // 檢查 token 是否過期（如果是 JWT）
    if (tokenValue) {
        try {
            const payload = JSON.parse(atob(tokenValue.split('.')[1]));
            const expiry = payload.exp;
            const now = Math.floor(Date.now() / 1000);

            if (expiry && now > expiry) {
                const response = NextResponse.redirect(new URL(basePath+"/login", req.url));
                response.cookies.delete("token");
                return response;
            }
        } catch (e) {
            // 解析失敗視為無效 token
            const response = NextResponse.redirect(new URL(basePath+"/login", req.url));
            response.cookies.delete("token");
            return response;
        }
    }

    // 未登入且訪問非公開頁面，導向 login
    if (!tokenValue && !isPublicPath) {
        return NextResponse.redirect(new URL(basePath+"/login", req.url));
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
const MATCH_ROUTES = [
    "/", "/home", "/kpi", "/kpi/newKpi", "/suggest", "/suggest/newSuggest", "/improvement", "/reportEntry", "/report"
];
// 套用 basePath，確保部署在 /iskpi 時仍能正確攔截
const matcher = MATCH_ROUTES.map(route => `${basePath}${route}`);

export const config = {
    matcher
};

