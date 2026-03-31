import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ERXES_API_URL: "http://localhost:4000/graphql",
    ERXES_URL: "http://localhost:4000",
    ERXES_FILE_URL: "http://localhost:4000/read-file?key=",
    ERXES_CP_ID: "UUuZ5v2YQnwjEj5r_iVQz",
    NEXT_PUBLIC_PMS_TOKEN: "",
    TEMPLATE_TYPE: "tour",
    NEXT_PUBLIC_POS_TOKEN: "o16LbW3jTsTspBuECzqY1nCPrFvvD858",
    ERXES_WEB_ID: "RiW86babHSW2AyuBRJA6l",
    ERXES_APP_TOKEN:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRQb3J0YWxJZCI6ImtxdjlPWE1yYmFJWV9mM05zOWZ5ayIsImlhdCI6MTc3NDU4OTU3M30.Ck4ZhMyi86axeie9d56Yc3rnbCUqosjP_x97fyoSSXM",
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
// export default {
//   env: {
//     ERXES_API_URL: "https://tegrigobi.app.erxes.io/gateway/graphql",
//     ERXES_URL: "https://tegrigobi.app.erxes.io/gateway",
//     ERXES_FILE_URL: "https://tegrigobi.app.erxes.io/gateway/read-file?key=",
//     ERXES_CP_ID: "gzeOstbmmN9HyDlLMDXNj",
//     ERXES_APP_TOKEN:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsibmFtZSI6IlRlZ3JpIiwiY3JlYXRlZEF0IjoiMjAyNS0wOC0wNlQxMzoyNToyNC41MDFaIiwidXNlckdyb3VwSWQiOiI0RUh5ZFREQWlzMkxkUW5abiIsImV4cGlyZURhdGUiOiIyMDI1LTA5LTA2VDAxOjQ5OjM4Ljk5NloiLCJub0V4cGlyZSI6dHJ1ZSwiYWxsb3dBbGxQZXJtaXNzaW9uIjp0cnVlLCJfaWQiOiJQZndzdnZKMVB4dEsyd0g2UlNGdVkiLCJfX3YiOjB9LCJpYXQiOjE3NTQ1MzEzODh9.I1_uKipwUsicxRbZ93xwRlDcPrbqUPZKX0AfILuPSnA",
//     NEXT_PUBLIC_POS_TOKEN: "d6GydPAvJnfesUb84FwKSZ8y3lkoVFtT",
//     NEXT_PUBLIC_PMS_TOKEN: "",
//     TEMPLATE_TYPE: "hotel",
//     BUILD_MODE: "production",
//     NEXT_PUBLIC_BUILD_MODE: "production",
//   },
//   images: {
//     unoptimized: true,
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "tegrigobi.app.erxes.io",
//       },
//     ],
//   },
// };
