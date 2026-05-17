'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Mail, Phone, Github, Linkedin, Download,
  ArrowLeft, MapPin, Calendar, Briefcase,
  Code2, ExternalLink, Star
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface Project {
  id: number
  title: string
  short_description: string
  cover_image_url: string | null
  technologies_list: string[]
  status: 'active' | 'completed' | 'in_progress'
  is_featured: boolean
  category_name: string | null
}

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const STATUS_CONFIG = {
  active:      { label: 'Aktiv',      color: '#3B6D11', bg: '#EAF3DE', dot: '#639922' },
  completed:   { label: 'Tamamlandı', color: '#185FA5', bg: '#E6F1FB', dot: '#378ADD' },
  in_progress: { label: 'Davam edir', color: '#854F0B', bg: '#FAEEDA', dot: '#EF9F27' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function fetchProfile(): Promise<Profile | null> {
  try {
    const res = await fetch(`${API_BASE}/profile/`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const arr = Array.isArray(data) ? data : data.results ?? []
    return arr[0] ?? null
  } catch {
    return null
  }
}

async function fetchFeaturedProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_BASE}/projects/?featured=true&page_size=6`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = await res.json()
    const arr = Array.isArray(data) ? data : data.results ?? []
    return arr.slice(0, 6)
  } catch {
    return []
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #E8E6DC 25%, #F1EFE8 50%, #E8E6DC 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

// ─── Mini Project Card ────────────────────────────────────────────────────────
function MiniProjectCard({ project, index }: { project: Project; index: number }) {
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.in_progress

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: '#fff',
          border: '0.5px solid rgba(0,0,0,0.07)',
          borderRadius: 14,
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.15s',
          animation: 'fadeUp 0.4s ease forwards',
          animationDelay: `${index * 0.07}s`,
          opacity: 0,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.transform = 'translateY(-3px)'
          el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.07)'
          el.style.borderColor = 'rgba(0,0,0,0.13)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'none'
          el.style.borderColor = 'rgba(0,0,0,0.07)'
        }}
      >
        {/* Thumbnail */}
        <div style={{
          position: 'relative', height: 140,
          background: '#F1EFE8', flexShrink: 0,
        }}>
          {project.cover_image_url ? (
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Code2 size={28} color="#D3D1C7" />
            </div>
          )}
          {project.is_featured && (
            <div style={{
              position: 'absolute', top: 8, right: 8,
              background: '#FAEEDA', border: '0.5px solid #FAC77544',
              borderRadius: 100, padding: '2px 8px',
              fontSize: 10, color: '#854F0B',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Star size={9} fill="#854F0B" /> Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
            <span style={{
              background: status.bg, border: `0.5px solid ${status.color}22`,
              borderRadius: 100, padding: '2px 8px',
              fontSize: 10, color: status.color,
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: status.dot, display: 'inline-block',
              }} />
              {status.label}
            </span>
            {project.category_name && (
              <span style={{ fontSize: 10, color: '#B4B2A9' }}>{project.category_name}</span>
            )}
          </div>

          <h3 style={{ fontSize: 13, fontWeight: 500, color: '#1A1916', marginBottom: 5, lineHeight: 1.35 }}>
            {project.title}
          </h3>

          {project.short_description && (
            <p style={{
              fontSize: 12, color: '#888780', lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              {project.short_description}
            </p>
          )}

          {project.technologies_list.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {project.technologies_list.slice(0, 3).map(tech => (
                <span key={tech} style={{
                  background: '#F1EFE8', border: '0.5px solid rgba(0,0,0,0.07)',
                  borderRadius: 5, padding: '1px 6px',
                  fontSize: 10, color: '#5F5E5A',
                  fontFamily: 'ui-monospace, monospace',
                }}>
                  {tech}
                </span>
              ))}
              {project.technologies_list.length > 3 && (
                <span style={{
                  background: '#F1EFE8', border: '0.5px solid rgba(0,0,0,0.07)',
                  borderRadius: 5, padding: '1px 6px',
                  fontSize: 10, color: '#B4B2A9',
                }}>
                  +{project.technologies_list.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 12, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: '#F1EFE8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#5F5E5A', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#1A1916', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 3, fontFamily: 'ui-monospace, monospace' }}>{label}</div>
      </div>
    </div>
  )
}

// ─── Contact Row ──────────────────────────────────────────────────────────────
function ContactRow({ icon, label, value, href }: {
  icon: React.ReactNode; label: string; value: string; href: string
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 11,
        border: '0.5px solid rgba(0,0,0,0.07)',
        background: '#fff', textDecoration: 'none',
        transition: 'border-color 0.15s, background 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.14)'
        e.currentTarget.style.background = '#FAFAF8'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'
        e.currentTarget.style.background = '#fff'
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: '#F1EFE8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#5F5E5A', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#B4B2A9', fontFamily: 'ui-monospace, monospace', marginBottom: 2 }}>{label}</div>
        <div style={{
          fontSize: 13, color: '#1A1916',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value}
        </div>
      </div>
      <ExternalLink size={12} color="#D3D1C7" />
    </a>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    Promise.all([fetchProfile(), fetchFeaturedProjects()]).then(([p, pr]) => {
      setProfile(p)
      setProjects(pr)
      setLoading(false)
      setTimeout(() => setVisible(true), 100)
    })
  }, [])

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
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 7,
          color: '#5F5E5A', textDecoration: 'none',
          fontSize: 13, transition: 'color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1A1916')}
          onMouseLeave={e => (e.currentTarget.style.color = '#5F5E5A')}
        >
          <ArrowLeft size={14} />
          Proyektlər
        </Link>

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
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── PROFILE HERO ── */}
        <section style={{
          padding: '52px 0 40px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <div style={{
            background: '#fff',
            border: '0.5px solid rgba(0,0,0,0.07)',
            borderRadius: 20, padding: '36px',
            display: 'flex', gap: 28, alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {loading ? (
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: '#F1EFE8',
                  animation: 'shimmer 1.4s infinite',
                  backgroundSize: '200% 100%',
                  backgroundImage: 'linear-gradient(90deg, #E8E6DC 25%, #F1EFE8 50%, #E8E6DC 75%)',
                }} />
              ) : profile?.avatar_url ? (
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
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
              ) : (
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: '#F1EFE8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '0.5px solid rgba(0,0,0,0.08)',
                }}>
                  <Code2 size={30} color="#D3D1C7" />
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Skeleton w="60%" h={28} r={8} />
                  <Skeleton w="40%" h={16} r={6} />
                  <Skeleton w="90%" h={14} r={6} />
                  <Skeleton w="75%" h={14} r={6} />
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#EAF3DE', border: '0.5px solid #63992222',
                    borderRadius: 100, padding: '3px 10px',
                    fontSize: 11, color: '#3B6D11', marginBottom: 12,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#639922', display: 'inline-block',
                    }} />
                    Mövcud / İşə hazır
                  </div>

                  <h1 style={{
                    fontSize: 'clamp(22px, 4vw, 30px)',
                    fontWeight: 500, lineHeight: 1.1,
                    letterSpacing: '-0.02em', color: '#1A1916', marginBottom: 6,
                  }}>
                    {profile?.full_name}
                  </h1>

                  <p style={{
                    fontSize: 14, color: '#888780',
                    marginBottom: 14, fontFamily: 'ui-monospace, monospace',
                  }}>
                    {profile?.title}
                    {profile?.years_experience ? ` · ${profile.years_experience} il təcrübə` : ''}
                  </p>

                  {profile?.bio && (
                    <p style={{
                      fontSize: 14, color: '#5F5E5A',
                      lineHeight: 1.75, maxWidth: 520,
                    }}>
                      {profile.bio}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── TWO COLUMN ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 16,
          marginBottom: 40,
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
        }}>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{
              fontSize: 11, fontWeight: 500, color: '#B4B2A9',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: 'ui-monospace, monospace',
              marginBottom: 4,
            }}>
              Statistika
            </h2>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{
                  background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)',
                  borderRadius: 12, padding: '14px 18px',
                  display: 'flex', gap: 12, alignItems: 'center',
                }}>
                  <Skeleton w={36} h={36} r={9} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skeleton w="40%" h={18} r={5} />
                    <Skeleton w="60%" h={11} r={4} />
                  </div>
                </div>
              ))
            ) : (
              <>
                <StatPill
                  icon={<Briefcase size={16} />}
                  label="İl təcrübə"
                  value={profile?.years_experience ?? '—'}
                />
                <StatPill
                  icon={<Code2 size={16} />}
                  label="Tamamlanan layihə"
                  value={projects.length > 0 ? `${projects.length}+` : '—'}
                />
                <StatPill
                  icon={<Star size={16} />}
                  label="Featured layihə"
                  value={projects.filter(p => p.is_featured).length || '—'}
                />
              </>
            )}
          </div>

          {/* Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{
              fontSize: 11, fontWeight: 500, color: '#B4B2A9',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: 'ui-monospace, monospace',
              marginBottom: 4,
            }}>
              Əlaqə
            </h2>
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)',
                  borderRadius: 11, padding: '12px 16px',
                  display: 'flex', gap: 12, alignItems: 'center',
                }}>
                  <Skeleton w={34} h={34} r={8} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <Skeleton w="30%" h={10} r={4} />
                    <Skeleton w="70%" h={13} r={4} />
                  </div>
                </div>
              ))
            ) : (
              <>
                {profile?.email && (
                  <ContactRow
                    icon={<Mail size={15} />}
                    label="Email"
                    value={profile.email}
                    href={`mailto:${profile.email}`}
                  />
                )}
                {profile?.phone && (
                  <ContactRow
                    icon={<Phone size={15} />}
                    label="Telefon"
                    value={profile.phone}
                    href={`tel:${profile.phone}`}
                  />
                )}
                {profile?.github && (
                  <ContactRow
                    icon={<Github size={15} />}
                    label="GitHub"
                    value={profile.github.replace('https://github.com/', '@')}
                    href={profile.github}
                  />
                )}
                {profile?.linkedin && (
                  <ContactRow
                    icon={<Linkedin size={15} />}
                    label="LinkedIn"
                    value={profile.linkedin.replace('https://www.linkedin.com/in/', '')}
                    href={profile.linkedin}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* ── FEATURED PROJECTS ── */}
        {(loading || projects.length > 0) && (
          <section style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 16,
            }}>
              <h2 style={{
                fontSize: 11, fontWeight: 500, color: '#B4B2A9',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                fontFamily: 'ui-monospace, monospace',
              }}>
                Seçilmiş layihələr
              </h2>
              <Link href="/" style={{
                fontSize: 12, color: '#185FA5', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                Hamısına bax <ExternalLink size={11} />
              </Link>
            </div>

            {loading ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 14,
              }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{
                    background: '#fff', borderRadius: 14,
                    border: '0.5px solid rgba(0,0,0,0.07)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: 140,
                      background: 'linear-gradient(90deg, #E8E6DC 25%, #F1EFE8 50%, #E8E6DC 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.4s infinite',
                    }} />
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Skeleton w="50%" h={12} r={5} />
                      <Skeleton w="85%" h={13} r={5} />
                      <Skeleton w="70%" h={11} r={5} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 14,
              }}>
                {projects.map((project, i) => (
                  <MiniProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '0.5px solid rgba(0,0,0,0.07)',
        textAlign: 'center', padding: '28px 24px',
        fontSize: 12, color: '#B4B2A9',
      }}>
        {profile?.full_name || 'Portfolio'} © {new Date().getFullYear()}
        {profile?.email && (
          <> · <a href={`mailto:${profile.email}`} style={{ color: '#185FA5', textDecoration: 'none' }}>{profile.email}</a></>
        )}
      </footer>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 620px) {
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}