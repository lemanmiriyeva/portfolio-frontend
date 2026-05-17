'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ExternalLink, Github, Globe, Star, Search,
  Code2, Layers, Filter, ArrowUpRight, Download,
  Mail, Phone, Linkedin, ChevronRight, Play
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProjectImage {
  id: number
  image_url: string
  caption: string
  order: number
}

interface Project {
  id: number
  title: string
  description: string
  short_description: string
  category_name: string | null
  images: ProjectImage[]
  cover_image_url: string | null
  video_url: string | null
  project_url: string | null
  github_url: string | null
  technologies_list: string[]
  status: 'active' | 'completed' | 'in_progress'
  is_featured: boolean
}

interface Category {
  id: number
  name: string
  slug: string
  project_count: number
}

interface Profile {
  full_name: string
  title: string
  bio: string
  email: string
  phone: string
  github: string
  linkedin: string
  avatar_url: string | null
  cv: string | null
  years_experience: number
}

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const STATUS_CONFIG = {
  active:      { label: 'Aktiv',      color: '#3B6D11', bg: '#EAF3DE', dot: '#639922' },
  completed:   { label: 'Tamamlandı', color: '#185FA5', bg: '#E6F1FB', dot: '#378ADD' },
  in_progress: { label: 'Davam edir', color: '#854F0B', bg: '#FAEEDA', dot: '#EF9F27' },
}

// ─── API helpers ──────────────────────────────────────────────────────────────

/**
 * Hər hansı bir API endpointindən array qaytarır.
 * Paginated  → data.results
 * Plain array → data
 * Digər obyekt → []
 */
function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (
    data !== null &&
    typeof data === 'object' &&
    'results' in (data as object) &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: T[] }).results
  }
  return []
}

async function apiFetch<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, {
      // Django REST Framework-də session/csrf olmadan JSON almaq üçün:
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      console.error(`[API] ${url} → HTTP ${res.status}`)
      return []
    }

    const data: unknown = await res.json()
    const result = extractArray<T>(data)
    console.debug(`[API] ${url} → ${result.length} item(s)`, result)
    return result
  } catch (err) {
    // CORS xətası, network xətası, JSON parse xətası hamısı burda tutulur
    console.error(`[API] fetch failed: ${url}`, err)
    return []
  }
}

async function fetchProjects(
  params: { category?: string; featured?: boolean; search?: string } = {}
): Promise<Project[]> {
  const q = new URLSearchParams()
  if (params.category) q.set('category', params.category)
  if (params.featured)  q.set('featured', 'true')
  if (params.search)    q.set('search', params.search)
  return apiFetch<Project>(`${API_BASE}/projects/?${q}`)
}

async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category>(`${API_BASE}/categories/`)
}

async function fetchProfile(): Promise<Profile | null> {
  const items = await apiFetch<Profile>(`${API_BASE}/profile/`)
  return items[0] ?? null
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '0.5px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: 200,
        background: 'linear-gradient(90deg, #E8E6DC 25%, #F1EFE8 50%, #E8E6DC 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }} />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[40, 75, 100, 60].map((w, i) => (
          <div key={i} style={{
            height: i === 1 ? 20 : 14,
            width: `${w}%`,
            borderRadius: 7,
            background: '#F1EFE8',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.in_progress

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article
        style={{
          background: '#fff',
          borderRadius: 16,
          border: '0.5px solid rgba(0,0,0,0.07)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.18s, transform 0.2s, box-shadow 0.2s',
          animation: 'fadeUp 0.45s ease forwards',
          animationDelay: `${index * 0.06}s`,
          opacity: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(0,0,0,0.13)'
          el.style.transform = 'translateY(-3px)'
          el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.07)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(0,0,0,0.07)'
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'none'
        }}
      >
        {/* Image */}
        <div style={{
          position: 'relative', height: 200,
          background: '#F1EFE8', overflow: 'hidden', flexShrink: 0,
        }}>
          {project.cover_image_url ? (
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Code2 size={36} color="#D3D1C7" />
            </div>
          )}

          {project.video_url && (
            <div style={{
              position: 'absolute', bottom: 10, left: 10,
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
              border: '0.5px solid rgba(0,0,0,0.08)',
              borderRadius: 100, padding: '3px 10px',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: '#5F5E5A',
            }}>
              <Play size={9} fill="#5F5E5A" color="#5F5E5A" />
              Video
            </div>
          )}

          {/* {project.is_featured && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              background: '#FAEEDA', border: '0.5px solid #FAC77544',
              borderRadius: 100, padding: '3px 10px',
              fontSize: 11, color: '#854F0B',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Star size={10} fill="#854F0B" />
              Featured
            </div>
          )} */}

          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(248,247,244,0.5) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{
              background: status.bg,
              border: `0.5px solid ${status.color}22`,
              borderRadius: 100, padding: '2px 9px',
              fontSize: 11, color: status.color,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: status.dot, display: 'inline-block',
              }} />
              {status.label}
            </span>
            {project.category_name && (
              <span style={{ fontSize: 11, color: '#B4B2A9' }}>{project.category_name}</span>
            )}
          </div>

          <h3 style={{
            fontSize: 15, fontWeight: 500,
            lineHeight: 1.35, color: '#1A1916', marginBottom: 8,
          }}>
            {project.title}
          </h3>

          <p style={{
            fontSize: 13, color: '#888780',
            lineHeight: 1.65, marginBottom: 14, flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {project.short_description || project.description}
          </p>

          {project.technologies_list.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
              {project.technologies_list.slice(0, 4).map(tech => (
                <span key={tech} style={{
                  background: '#F1EFE8',
                  border: '0.5px solid rgba(0,0,0,0.07)',
                  borderRadius: 6, padding: '2px 8px',
                  fontSize: 11, color: '#5F5E5A',
                  fontFamily: 'ui-monospace, monospace',
                }}>
                  {tech}
                </span>
              ))}
              {project.technologies_list.length > 4 && (
                <span style={{
                  background: '#F1EFE8', border: '0.5px solid rgba(0,0,0,0.07)',
                  borderRadius: 6, padding: '2px 8px',
                  fontSize: 11, color: '#B4B2A9',
                }}>
                  +{project.technologies_list.length - 4}
                </span>
              )}
            </div>
          )}

          <div style={{
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            paddingTop: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ color: '#185FA5', display: 'flex', alignItems: 'center' }}
                  title="Sayta keç"
                >
                  <Globe size={15} />
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ color: '#888780', display: 'flex', alignItems: 'center' }}
                  title="GitHub"
                >
                  <Github size={15} />
                </a>
              )}
            </div>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 12, color: '#185FA5',
            }}>
              Ətraflı <ChevronRight size={13} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.07)',
      borderRadius: 14, padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{ color: '#B4B2A9', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 500, color: '#1A1916', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 5, fontFamily: 'ui-monospace, monospace' }}>
        {label}
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{
      textAlign: 'center', padding: '72px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: '#F1EFE8', border: '0.5px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Code2 size={24} color="#D3D1C7" />
      </div>
      <h3 style={{ fontWeight: 500, fontSize: 17, color: '#1A1916' }}>Proyekt tapılmadı</h3>
      <p style={{ fontSize: 13, color: '#888780' }}>Fərqli filter və ya axtarış cəhd edin</p>
      <button
        onClick={onReset}
        style={{
          marginTop: 4,
          padding: '8px 18px', borderRadius: 9,
          border: '0.5px solid rgba(0,0,0,0.1)',
          background: '#fff', color: '#1A1916',
          fontSize: 13, cursor: 'pointer',
        }}
      >
        Sıfırla
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [projects, setProjects]         = useState<Project[]>([])
  const [categories, setCategories]     = useState<Category[]>([])
  const [profile, setProfile]           = useState<Profile | null>(null)
  const [loading, setLoading]           = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const [showFeatured, setShowFeatured] = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [statsVisible, setStatsVisible] = useState(false)
  const [year, setYear]                 = useState('')

  useEffect(() => { setYear(String(new Date().getFullYear())) }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadData = useCallback(async () => {
    setLoading(true)
    setStatsVisible(false)

    const [p, c, pr] = await Promise.all([
      fetchProjects({
        category: activeCategory || undefined,
        featured: showFeatured || undefined,
        search:   searchQuery   || undefined,
      }),
      fetchCategories(),
      fetchProfile(),
    ])

    setProjects(p)
    setCategories(c)
    setProfile(pr)
    setLoading(false)
    setTimeout(() => setStatsVisible(true), 200)
  }, [activeCategory, showFeatured, searchQuery])

  useEffect(() => { loadData() }, [loadData])

  const resetFilters = () => {
    setActiveCategory('')
    setShowFeatured(false)
    setSearchInput('')
    setSearchQuery('')
  }

  const stats = {
    total:    projects.length,
    active:   projects.filter(p => p.status === 'active').length,
    featured: projects.filter(p => p.is_featured).length,
    tech:     Array.from(new Set(projects.flatMap(p => p.technologies_list))).length,
  }

  const hasActiveFilter = activeCategory || showFeatured || searchQuery

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(248,247,244,0.92)', backdropFilter: 'blur(14px)',
        borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        height: 58, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: '#1A1916',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Code2 size={15} color="white" />
          </div>
          <span style={{ fontWeight: 500, fontSize: 15, color: '#1A1916' }}>
            {profile?.full_name || 'Portfolio'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 13px', borderRadius: 8,
                border: '0.5px solid rgba(0,0,0,0.1)',
                background: '#fff', color: '#5F5E5A',
                fontSize: 12, textDecoration: 'none',
              }}
            >
              <Mail size={13} /> Əlaqə
            </a>
          )}
          {profile?.cv && (
            <a
              href={profile.cv}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 13px', borderRadius: 8,
                background: '#1A1916', color: '#fff',
                fontSize: 12, textDecoration: 'none',
              }}
            >
              <Download size={13} /> CV
            </a>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── HERO ── */}
        <section style={{ padding: '64px 0 52px', textAlign: 'center' }}>
          {profile?.avatar_url && (
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                overflow: 'hidden', position: 'relative',
                border: '0.5px solid rgba(0,0,0,0.1)',
              }}>
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.09)',
            borderRadius: 100, padding: '5px 14px',
            fontSize: 12, color: '#5F5E5A', marginBottom: 20,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#639922', display: 'inline-block',
            }} />
            {profile?.title || 'Full-Stack Developer'}
            {profile?.years_experience ? ` · ${profile.years_experience} il təcrübə` : ''}
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 500, lineHeight: 1.1,
            letterSpacing: '-0.025em', color: '#1A1916', marginBottom: 16,
          }}>
            {profile?.full_name || 'Proyektlərim'}
          </h1>

          {profile?.bio && (
            <p style={{
              fontSize: 16, color: '#888780',
              maxWidth: 520, margin: '0 auto 28px',
              lineHeight: 1.75,
            }}>
              {profile.bio}
            </p>
          )}

          {(profile?.github || profile?.linkedin || profile?.phone) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {profile?.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  border: '0.5px solid rgba(0,0,0,0.1)',
                  background: '#fff', color: '#5F5E5A',
                  fontSize: 12, textDecoration: 'none',
                }}>
                  <Github size={13} /> GitHub
                </a>
              )}
              {profile?.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  border: '0.5px solid rgba(0,0,0,0.1)',
                  background: '#fff', color: '#5F5E5A',
                  fontSize: 12, textDecoration: 'none',
                }}>
                  <Linkedin size={13} /> LinkedIn
                </a>
              )}
              {profile?.phone && (
                <a href={`tel:${profile.phone}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  border: '0.5px solid rgba(0,0,0,0.1)',
                  background: '#fff', color: '#5F5E5A',
                  fontSize: 12, textDecoration: 'none',
                }}>
                  <Phone size={13} /> {profile.phone}
                </a>
              )}
            </div>
          )}
        </section>

        {/* ── STATS ── */}
        {/* <section style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12, marginBottom: 52,
          opacity: statsVisible ? 1 : 0,
          transform: statsVisible ? 'none' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <StatCard value={stats.total}    label="Toplam proyekt" icon={<Layers size={17} />} />
          <StatCard value={stats.active}   label="Aktiv"          icon={<Globe size={17} />} />
          <StatCard value={stats.featured} label="Featured"       icon={<Star size={17} />} />
          <StatCard value={stats.tech}     label="Texnologiya"    icon={<Code2 size={17} />} />
        </section> */}

        {/* ── FILTERS ── */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ position: 'relative', maxWidth: 400, marginBottom: 16 }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: '#B4B2A9', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Proyekt axtarın..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: 9, padding: '10px 12px 10px 36px',
                fontSize: 13, color: '#1A1916',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#B5D4F4')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <Filter size={13} color="#B4B2A9" style={{ marginRight: 2 }} />

            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 13px', borderRadius: 100,
                border: '0.5px solid',
                fontSize: 12, cursor: 'pointer',
                transition: 'all 0.15s',
                ...(!hasActiveFilter
                  ? { background: '#1A1916', color: '#fff', borderColor: '#1A1916' }
                  : { background: '#fff', color: '#5F5E5A', borderColor: 'rgba(0,0,0,0.1)' }),
              }}
            >
              Hamısı
            </button>

            <button
              onClick={() => { setShowFeatured(!showFeatured); setActiveCategory('') }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 13px', borderRadius: 100,
                border: '0.5px solid', fontSize: 12, cursor: 'pointer',
                transition: 'all 0.15s',
                ...(showFeatured
                  ? { background: '#FAEEDA', color: '#854F0B', borderColor: '#FAC77555' }
                  : { background: '#fff', color: '#5F5E5A', borderColor: 'rgba(0,0,0,0.1)' }),
              }}
            >
              <Star size={11} fill={showFeatured ? '#854F0B' : 'none'} />
              Featured
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.slug); setShowFeatured(false) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '6px 13px', borderRadius: 100,
                  border: '0.5px solid', fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.15s',
                  ...(activeCategory === cat.slug
                    ? { background: '#1A1916', color: '#fff', borderColor: '#1A1916' }
                    : { background: '#fff', color: '#5F5E5A', borderColor: 'rgba(0,0,0,0.1)' }),
                }}
              >
                {cat.name}
                <span style={{ opacity: 0.5, fontSize: 11 }}>({cat.project_count})</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── PROJECT GRID ── */}
        <section>
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}>
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '0.5px solid rgba(0,0,0,0.07)',
        textAlign: 'center', padding: '28px 24px',
        fontSize: 12, color: '#B4B2A9',
      }}>
        {profile?.full_name || 'Portfolio'}{year ? ` © ${year}` : ''}
        {profile?.email && (
          <> · <a href={`mailto:${profile.email}`} style={{ color: '#185FA5', textDecoration: 'none' }}>{profile.email}</a></>
        )}
      </footer>

    </div>
  )
}

/*
  ── globals.css-ə bu CSS-i əlavə edin ──────────────────────────────────────

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  * { box-sizing: border-box; }
  a, button { transition: opacity 0.15s; }

  ────────────────────────────────────────────────────────────────────────────
*/