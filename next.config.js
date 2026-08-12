/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    const backendOrigin = process.env.BACKEND_API_ORIGIN || "http://127.0.0.1:8000";
    return [{ source: "/api/:path*", destination: `${backendOrigin}/api/:path*` }];
  },
};

module.exports = nextConfig;
