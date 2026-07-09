import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = await createClient()
  const { data: negocios } = await supabase
    .from('negocios')
    .select('id, created_at')

  const baseUrl = 'https://comidascienaga.com'

  const negociosUrls = negocios?.map(negocio => ({
    url: `${baseUrl}/negocio/${negocio.id}`,
    lastModified: negocio.created_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...negociosUrls,
  ]
}