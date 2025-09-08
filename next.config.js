// next.config.ts

// 從環境變數取得 API 基本 URL
const API_URL = process.env.API || "http://127.0.0.1:5013";
const RAG_API = process.env.RAG_API || "http://127.0.0.1:5013";
const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isDev = process.env.NODE_ENV === "development";

const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://static.cloudflareinsights.com",
    "https://challenges.cloudflare.com",
];

if (isDev) {
    scriptSrc.push("'unsafe-eval'");
}

const securityHeaders = [
    {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload"
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff"
    },
    {
        key: "X-Frame-Options",
        value: "SAMEORIGIN"
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
    },
    {
        key: "Permissions-Policy",
        value: "geolocation=(), camera=(), microphone=()"
    }
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const assetPrefix = basePath;

const nextConfig = {
    basePath,
    assetPrefix,
    poweredByHeader: false,
    experimental: {
        serverActions: {
            allowedOrigins: [
                'https://security.bip.gov.tw',
                'https://kpi.isafe.org.tw'
            ],
            bodySizeLimit: '10mb',
        }
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders
            }
        ];
    },
    async rewrites() {
        return [
            {
                source: "/proxy/:path*",
                destination: `${API_URL}/:path*`,
                basePath: false,
                locale: false
            },
            {
                source: "/app/:path*",
                destination: `${RAG_API}/:path*`,
                basePath: false,
                locale: false
            }
        ];
    },
    async redirects() {
        const redirects = [];

        // 如果有 basePath，設定路徑標準化重定向
        if (basePath) {
            redirects.push(
                // 根路徑重定向到 basePath/
                {
                    source: '/',
                    destination: `${basePath}/`,
                    permanent: false
                },

            );
        }

        return redirects;
    }
};

module.exports = nextConfig;
