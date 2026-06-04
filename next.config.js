/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-supabase-url.supabase.co'],
  },
  // No output: 'export' – this is for static sites only
  // No exportPathMap
};

module.exports = nextConfig;