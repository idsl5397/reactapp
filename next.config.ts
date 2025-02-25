import type { NextConfig } from "next";

// 從環境變數取得 API 基本 URL
const API_URL = process.env.NEXT_PUBLIC_API_URL||"https://api.isafe.org.tw";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/proxy/:path*",  // 匹配 /proxy/ 後的所有路徑
                destination: `${API_URL}/:path*`,  // 將路徑轉發到 API_URL
                basePath: false,  // 停用 basePath 處理
                locale: false,    // 停用 locale 處理
            },
        ];
    },
};

export default nextConfig;
