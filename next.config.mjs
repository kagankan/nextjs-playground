const isAppHostingBuild = process.env.APP_HOSTING_BUILD === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: isAppHostingBuild
    ? "https://nextjs-playground-app--nextjs-playground-b1ad1.us-central1.hosted.app"
    : "",
};

export default nextConfig;
