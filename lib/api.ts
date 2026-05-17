const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Project {
  id: number
  title: string
  description: string
  short_description: string
  category: number | null
  category_name: string | null
  image: string | null
  image_url: string | null
  video_url: string | null
  video_file: string | null
  project_url: string | null
  github_url: string | null
  technologies: string
  technologies_list: string[]
  status: 'active' | 'completed' | 'in_progress'
  is_featured: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  project_count: number
}

export interface Profile {
  id: number
  full_name: string
  title: string
  bio: string
  email: string
  phone: string
  github: string
  linkedin: string
  avatar: string | null
  avatar_url: string | null
  cv: string | null
  years_experience: number
}

export async function fetchProjects(params?: {
  category?: string
  featured?: boolean
  search?: string
}): Promise<Project[]> {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.set('category', params.category)
  if (params?.featured) searchParams.set('featured', 'true')
  if (params?.search) searchParams.set('search', params.search)

  const url = `${API_URL}/api/projects/${searchParams.toString() ? '?' + searchParams.toString() : ''}`

  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('API xətası')
    const data = await res.json()
    return data.results || data
  } catch {
    console.error('Projects yüklənmədi:', url)
    return []
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories/`, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error('API xətası')
    const data = await res.json()
    return data.results || data
  } catch {
    return []
  }
}

export async function fetchProfile(): Promise<Profile | null> {
  try {
    const res = await fetch(`${API_URL}/api/profile/`, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error('API xətası')
    const data = await res.json()
    const profiles = data.results || data
    return Array.isArray(profiles) ? profiles[0] || null : profiles
  } catch {
    return null
  }
}
