import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.142.9.67', '192.168.0.13', '192.168.0.4'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com; style-src 'self' 'unsafe-inline' https://checkout.razorpay.com; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 http://10.142.9.67:5000 http://192.168.0.13:5000 http://192.168.0.4:5000 ws://localhost:5000 ws://127.0.0.1:5000 ws://10.142.9.67:5000 ws://192.168.0.13:5000 ws://192.168.0.4:5000 https://api.razorpay.com https://lumberjack.razorpay.com https://cdn.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
