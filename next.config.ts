import type { NextConfig } from "next";
import { getSupabaseImageHostname } from "./src/lib/utils/supabase-image";

const supabaseHostname = getSupabaseImageHostname();

const nextConfig: NextConfig = {
  images: supabaseHostname
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
