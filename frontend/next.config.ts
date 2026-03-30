import type { NextConfig } from "next";

// PWA config requires setup with next 15 turbopack. Temporarily disabled for clean 'npm run dev'
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true
// });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig; // export default withPWA(nextConfig);
