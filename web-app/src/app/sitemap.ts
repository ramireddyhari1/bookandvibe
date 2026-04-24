import { MetadataRoute } from 'next'

interface Event {
  id: string;
  updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bookandvibe.in'
  const apiUrl = 'https://api.bookandvibe.in/api'

  // Static routes
  const routes = [
    '',
    '/events',
    '/gamehub',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic event routes
  try {
    const response = await fetch(`${apiUrl}/events?limit=100`)
    const { data } = await response.json()
    
    if (Array.isArray(data)) {
      const eventRoutes = data.map((event: Event) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: new Date(event.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      return [...routes, ...eventRoutes]
    }
  } catch (error) {
    console.error('Sitemap event fetch failed:', error)
  }

  return routes
}
