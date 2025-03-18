import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

    const isLoginPage = req.nextUrl.pathname === "/login";
    console.log(token);
    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

/**
 * 設定要攔截的路由。
 * 僅適用於指定的路由，確保這些頁面需要登入驗證。
 */
export const config = {
    matcher: ["/", "/home", "/kpi", "/improvement", "/reportEntry", "/register"],
};
