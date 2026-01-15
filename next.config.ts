// import path from "path";
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   env: {
//     ERXES_API_URL: "http://localhost:4000/graphql",
//     ERXES_URL: "http://localhost:4000",
//     ERXES_FILE_URL: "http://localhost:4000/read-file?key=",
//     ERXES_CP_ID: "UUuZ5v2YQnwjEj5r_iVQz",
//     NEXT_PUBLIC_PMS_TOKEN: "",
//     TEMPLATE_TYPE: "hotel",
//     ERXES_APP_TOKEN:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsibmFtZSI6IkJNUyB0ZXN0IiwiY3JlYXRlZEF0IjoiMjAyNC0xMi0wMlQxMTowOTowOC42MDNaIiwidXNlckdyb3VwSWQiOiJuTlBtbmtKbXdHdHEycXVoeiIsImV4cGlyZURhdGUiOiIyMDI1LTAxLTAzVDAyOjU0OjU2LjIwOFoiLCJub0V4cGlyZSI6dHJ1ZSwiYWxsb3dBbGxQZXJtaXNzaW9uIjp0cnVlLCJfaWQiOiJiYU5DZ0FTVXNkMWdheFBYVV83VGUiLCJfX3YiOjB9LCJpYXQiOjE3MzMyODA5MDh9.xPo9ijx7LsHfs3NamL836hFhJMtUnnB0sGbDztSKi3E",
//   },
//   images: {
//     unoptimized: true,
//   },
//   webpack: (config) => {
//     config.resolve.alias["@"] = path.resolve(__dirname);
//     return config;
//   },
// };

// export default nextConfig;
export default {
  env: {
    ERXES_API_URL: "https://sales.app.erxes.io/gateway/graphql",
    ERXES_URL: "https://sales.app.erxes.io/gateway",
    ERXES_FILE_URL: "https://sales.app.erxes.io/gateway/read-file?key=",
    ERXES_CP_ID: "nwYOCDEOph3oAqo73dHq0",
    ERXES_APP_TOKEN:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsibmFtZSI6IkVjb20iLCJjcmVhdGVkQXQiOiIyMDI1LTExLTA1VDAzOjQ4OjM3Ljg1N1oiLCJ1c2VyR3JvdXBJZCI6IjRFSHlkVERBaXMyTGRRblpuIiwiZXhwaXJlRGF0ZSI6IjIwMjUtMTItMTBUMTI6Mzc6NDEuNDY4WiIsIm5vRXhwaXJlIjp0cnVlLCJhbGxvd0FsbFBlcm1pc3Npb24iOnRydWUsIl9pZCI6IkZIUmVaSnNzYnZoYlQwSzZGZENneiIsIl9fdiI6MH0sImlhdCI6MTc2Mjc3ODI3MX0.aMcXwEHazogNwgeCTdshdj6ymRxb9UWr5Y1xgdU_5TY",
    NEXT_PUBLIC_POS_TOKEN: "L1OQRxY65cWnx51WCdxum3s44egupVxE",
    NEXT_PUBLIC_PMS_TOKEN: "",
    TEMPLATE_TYPE: "ecommerce",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sales.app.erxes.io",
      },
    ],
  },
};
