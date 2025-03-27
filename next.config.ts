import type { NextConfig } from "next";

// 從環境變數取得 API 基本 URL
const API_URL = process.env.API || "http://127.0.0.1:5013";
// const isDev = process.env.NODE_ENV === "development";
// const Mydomain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
const RAG_API = process.env.RAG_API || "http://127.0.0.1:5013";

const nextConfig: NextConfig = {
    poweredByHeader: false, // 禁用 X-Powered-By 標頭

    async headers() {
        return [
            {
                source: '/(.*)', // 應用於所有路徑
                headers: [
                    {
                        key: 'X-Powered-By',
                        value: '', // 雙重保險移除標頭
                    }
                ],
            },
        ];
    },

    async rewrites() {
        return [
            {
                source: "/proxy/:path*",  // 匹配 /proxy/ 後的所有路徑
                destination: `${API_URL}/:path*`,  // 將路徑轉發到 API_URL
                basePath: false,  // 停用 basePath 處理
                locale: false,    // 停用 locale 處理
            },
            {
                source: "/app/:path*",
                destination: `${RAG_API}/:path*`,
                basePath: false,
                locale: false,
            },
        ];
    },
};



export default nextConfig;
