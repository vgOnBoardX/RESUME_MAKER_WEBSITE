import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["pdfjs-dist", "mammoth"],
};

export default nextConfig;
