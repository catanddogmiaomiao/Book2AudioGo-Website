import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolve metadata before rendering the document so crawlers receive it in <head>.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
