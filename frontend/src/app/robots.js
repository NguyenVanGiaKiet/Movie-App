export default function robots() {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://hopphim.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
