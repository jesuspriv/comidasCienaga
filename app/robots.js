export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/dashboard/editar'],
    },
    sitemap: 'https://comidascienaga.com/sitemap.xml',
  }
}