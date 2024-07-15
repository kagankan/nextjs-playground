const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: isProd
    ? "https://nextjs-playground-app--nextjs-playground-b1ad1.us-central1.hosted.app"
    : "",
};

export default nextConfig;
