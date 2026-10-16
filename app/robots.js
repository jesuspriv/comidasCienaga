import { SITE_URL } from '@/lib/sitio'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/dashboard/editar'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}