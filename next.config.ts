import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";

// 從環境變數取得 API 基本 URL
const API_URL = process.env.API || "http://127.0.0.1:5013";
// const isDev = process.env.NODE_ENV === "development";
// const Mydomain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
const RAG_API = process.env.RAG_API || "http://127.0.0.1:5013";

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
    },
    {
        key: "Content-Security-Policy",
        value: `
      default-src 'self';
      script-src ${scriptSrc.join(" ")};
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' https: data:;
      connect-src 'self' https:;
      frame-src https://challenges.cloudflare.com;
      worker-src 'self' blob:;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, " ").trim()
    },
    {
        key: 'X-Powered-By',
        value: '' // 再保險移除
    }
];
const basePath = process.env.BASE_PATH || "";
const nextConfig: NextConfig = {
    basePath,
    poweredByHeader: false,

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
    }
};



export default withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "3d43ab6c3620",
    project: "kpi-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
});