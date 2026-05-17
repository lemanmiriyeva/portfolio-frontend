'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, Github, Globe, Play, Pause,
  ChevronLeft, ChevronRight, X, ZoomIn, Calendar,
  Clock, Tag, Star, Code2, ArrowUpRight, Share2, Check
} from 'lucide-react'

// ─── Types (matches your serializers) ────────────────────────────────────────
interface ProjectImage {
  id: number
  image: string
  image_url: string
  caption: string
  order: number
}

interface Project {
  id: number
  title: string
  description: string
  short_description: string
  category: number | null
  category_name: string | null
  images: ProjectImage[]
  cover_image_url: string | null
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const STATUS_CONFIG = {
  active:      { label: 'Aktiv',       color: '#3B6D11', bg: '#EAF3DE', dot: '#639922' },
  completed:   { label: 'Tamamlandı',  color: '#185FA5', bg: '#E6F1FB', dot: '#378ADD' },
  in_progress: { label: 'Davam edir',  color: '#854F0B', bg: '#FAEEDA', dot: '#EF9F27' },
}

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\s?]+)/)
  return m ? m[1] : null
}
function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : null
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  images, index, onClose, onChange,
}: {
  images: ProjectImage[]
  index: number
  onClose: () => void
  onChange: (i: number) => void
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onChange((index - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') onChange((index + 1) % images.length)
    }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [index, images.length, onClose, onChange])

  const img = images[index]
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,10,10,0.95)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)',
          borderRadius: '50%', width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer',
        }}
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div style={{
        position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: 100, padding: '5px 14px',
        fontSize: 13, color: 'rgba(255,255,255,0.7)',
      }}>
        {index + 1} / {images.length}
      </div>

      {/* Image */}
      <div
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={img.image_url || img.image}
          alt={img.caption || `Şəkil ${index + 1}`}
          width={1200}
          height={800}
          style={{ objectFit: 'contain', maxHeight: '80vh', width: 'auto' }}
        />
      </div>

      {/* Caption */}
      {img.caption && (
        <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' }}>
          {img.caption}
        </p>
      )}

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onChange((index - 1 + images.length) % images.length) }}
            style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: '50%', width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onChange((index + 1) % images.length) }}
            style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: '50%', width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  )
}

// ─── Gallery Slider ────────────────────────────────────────────────────────────
function GallerySlider({ images }: { images: ProjectImage[] }) {
  const [current, setCurrent] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length])

  // Swipe support
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 40) dx > 0 ? next() : prev()
  }

  if (images.length === 0) return null

  const img = images[current]

  return (
    <>
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#F1EFE8', userSelect: 'none' }}>
        {/* Main image */}
        <div
          style={{ position: 'relative', height: 480, cursor: 'zoom-in' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setLightboxIndex(current)}
        >
          <Image
            src={img.image_url || img.image}
            alt={img.caption || img.caption || `Şəkil ${current + 1}`}
            fill
            style={{ objectFit: 'cover', transition: 'opacity 0.3s ease' }}
            priority
          />
          {/* Zoom hint */}
          <div style={{
            position: 'absolute', bottom: 14, right: 14,
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
            border: '0.5px solid rgba(0,0,0,0.1)',
            borderRadius: 8, padding: '5px 10px',
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#5F5E5A',
          }}>
            <ZoomIn size={13} />
            Böyüt
          </div>
          {/* Counter pill */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 14, left: 14,
              background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
              border: '0.5px solid rgba(0,0,0,0.1)',
              borderRadius: 100, padding: '5px 12px',
              fontSize: 12, color: '#5F5E5A',
            }}>
              {current + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Caption */}
        {img.caption && (
          <div style={{
            padding: '12px 18px',
            background: '#fff',
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            fontSize: 13, color: '#888780',
          }}>
            {img.caption}
          </div>
        )}

        {/* Prev / Next buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
                border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '50%', width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#1A1916',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
                border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '50%', width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#1A1916',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          ref={trackRef}
          style={{
            display: 'flex', gap: 8, marginTop: 10,
            overflowX: 'auto', paddingBottom: 4,
            scrollbarWidth: 'none',
          }}
        >
          {images.map((im, i) => (
            <button
              key={im.id}
              onClick={() => setCurrent(i)}
              style={{
                flexShrink: 0,
                width: 72, height: 56,
                borderRadius: 8, overflow: 'hidden',
                position: 'relative',
                border: i === current
                  ? '2px solid #185FA5'
                  : '2px solid transparent',
                opacity: i === current ? 1 : 0.6,
                cursor: 'pointer',
                transition: 'all 0.18s',
                background: '#F1EFE8',
              }}
            >
              <Image
                src={im.image_url || im.image}
                alt={im.caption || `Şəkil ${i + 1}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </>
  )
}

// ─── Video Player ──────────────────────────────────────────────────────────────
function VideoSection({ videoUrl, videoFile }: { videoUrl?: string | null; videoFile?: string | null }) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  if (!videoUrl && !videoFile) return null

  const youtubeId = videoUrl ? getYoutubeId(videoUrl) : null
  const vimeoId = videoUrl ? getVimeoId(videoUrl) : null

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '0.5px solid rgba(0,0,0,0.08)', background: '#0a0a0a' }}>
      <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
        {youtubeId && (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {vimeoId && !youtubeId && (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?color=185FA5&title=0&byline=0`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
        {videoFile && !youtubeId && !vimeoId && (
          <>
            <video
              ref={videoRef}
              src={videoFile}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            {!playing && (
              <button
                onClick={() => videoRef.current?.play()}
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Play size={24} fill="#1A1916" color="#1A1916" style={{ marginLeft: 3 }} />
                </div>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Share Button ──────────────────────────────────────────────────────────────
function ShareButton() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 16px', borderRadius: 10,
        border: '0.5px solid rgba(0,0,0,0.12)',
        background: '#fff', color: '#5F5E5A',
        fontSize: 13, cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {copied ? <><Check size={14} color="#3B6D11" /> Kopyalandı</> : <><Share2 size={14} /> Paylaş</>}
    </button>
  )
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '12px 0',
      borderBottom: '0.5px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140, color: '#888780', fontSize: 13 }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#1A1916', fontWeight: 400 }}>{value}</div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const id = params?.id
    if (!id) return
    fetch(`${API_BASE}/projects/${id}/`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { setProject(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [params?.id])

  if (loading) return <LoadingSkeleton />
  if (error || !project) return <NotFound onBack={() => router.push('/')} />

  const status = STATUS_CONFIG[project.status]
  const youtubeId = project.video_url ? getYoutubeId(project.video_url) : null
  const vimeoId = project.video_url ? getVimeoId(project.video_url) : null
  const hasVideo = youtubeId || vimeoId || project.video_file
  const hasImages = project.images.length > 0

  // Determine what to show first — video takes priority
  const mediaOrder: Array<'video' | 'gallery'> = hasVideo
    ? ['video', 'gallery']
    : ['gallery']

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(248,247,244,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        height: 58, display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 12,
      }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '7px 12px', borderRadius: 9,
            border: '0.5px solid rgba(0,0,0,0.1)',
            background: '#fff',
            color: '#5F5E5A', fontSize: 13,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
        >
          <ArrowLeft size={14} />
          Geri
        </Link>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginLeft: 4, fontSize: 13, color: '#888780',
        }}>
          <span style={{ color: '#D3D1C7' }}>/</span>
          <span>Proyektlər</span>
          <span style={{ color: '#D3D1C7' }}>/</span>
          <span style={{ color: '#1A1916', fontWeight: 500 }}>{project.title}</span>
        </div>
      </nav>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── HEADER ── */}
        <header style={{ padding: '44px 0 36px' }}>
          {/* Category + Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {project.category_name && (
              <span style={{
                background: '#F1EFE8', border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: 100, padding: '4px 12px',
                fontSize: 12, color: '#5F5E5A',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <Tag size={11} />
                {project.category_name}
              </span>
            )}
            <span style={{
              background: status.bg, border: `0.5px solid ${status.color}22`,
              borderRadius: 100, padding: '4px 12px',
              fontSize: 12, color: status.color,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: status.dot, display: 'inline-block' }} />
              {status.label}
            </span>
            {project.is_featured && (
              <span style={{
                background: '#FAEEDA', border: '0.5px solid #FAC77544',
                borderRadius: 100, padding: '4px 12px',
                fontSize: 12, color: '#854F0B',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <Star size={11} fill="#854F0B" />
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 500, lineHeight: 1.15,
            letterSpacing: '-0.02em', color: '#1A1916',
            marginBottom: 18,
          }}>
            {project.title}
          </h1>

          {/* Short description */}
          {project.short_description && (
            <p style={{
              fontSize: 17, color: '#5F5E5A', lineHeight: 1.7,
              maxWidth: 680, marginBottom: 24,
            }}>
              {project.short_description}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 20px', borderRadius: 10,
                  background: '#1A1916', color: '#fff',
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                <Globe size={15} />
                Sayta keç
                <ArrowUpRight size={13} />
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 20px', borderRadius: 10,
                  border: '0.5px solid rgba(0,0,0,0.12)',
                  background: '#fff', color: '#1A1916',
                  fontSize: 14, textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                <Github size={15} />
                GitHub
              </a>
            )}
            <ShareButton />
          </div>
        </header>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: 32,
          alignItems: 'start',
        }}>

          {/* ── LEFT COLUMN — Media + Description ── */}
          <div>
            {/* VIDEO first if available */}
            {hasVideo && (
              <div style={{ marginBottom: 16 }}>
                <SectionLabel icon={<Play size={14} />} text="Video" />
                <VideoSection videoUrl={project.video_url} videoFile={project.video_file} />
              </div>
            )}

            {/* GALLERY */}
            {hasImages && (
              <div style={{ marginBottom: 32 }}>
                <SectionLabel icon={<Code2 size={14} />} text={`Şəkillər (${project.images.length})`} />
                <GallerySlider images={project.images} />
              </div>
            )}

            {/* FULL DESCRIPTION */}
            <div style={{ marginBottom: 32 }}>
              <SectionLabel icon={<Code2 size={14} />} text="Proyekt haqqında" />
              <div style={{
                background: '#fff', borderRadius: 14,
                border: '0.5px solid rgba(0,0,0,0.07)',
                padding: '28px 32px',
              }}>
                <p style={{
                  fontSize: 15, lineHeight: 1.85,
                  color: '#444441', whiteSpace: 'pre-line',
                }}>
                  {project.description}
                </p>
              </div>
            </div>

            {/* TECHNOLOGIES */}
            {project.technologies_list.length > 0 && (
              <div>
                <SectionLabel icon={<Tag size={14} />} text="Texnologiyalar" />
                <div style={{
                  background: '#fff', borderRadius: 14,
                  border: '0.5px solid rgba(0,0,0,0.07)',
                  padding: '22px 28px',
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {project.technologies_list.map(tech => (
                      <span
                        key={tech}
                        style={{
                          background: '#F1EFE8',
                          border: '0.5px solid rgba(0,0,0,0.08)',
                          borderRadius: 8, padding: '6px 14px',
                          fontSize: 13, color: '#5F5E5A',
                          fontFamily: 'ui-monospace, monospace',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Meta Sidebar ── */}
          <aside>
            {/* Project Info Card */}
            <div style={{
              background: '#fff',
              border: '0.5px solid rgba(0,0,0,0.08)',
              borderRadius: 14,
              padding: '22px 24px',
              marginBottom: 14,
            }}>
              <p style={{ fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Proyekt məlumatları
              </p>
              <InfoRow
                icon={<Clock size={13} />}
                label="Status"
                value={status.label}
              />
              {project.category_name && (
                <InfoRow
                  icon={<Tag size={13} />}
                  label="Kateqoriya"
                  value={project.category_name}
                />
              )}
              <InfoRow
                icon={<Calendar size={13} />}
                label="Yaradıldı"
                value={formatDate(project.created_at)}
              />
              <InfoRow
                icon={<Calendar size={13} />}
                label="Yeniləndi"
                value={formatDate(project.updated_at)}
              />
              {project.is_featured && (
                <InfoRow
                  icon={<Star size={13} />}
                  label="Featured"
                  value="Bəli"
                />
              )}
            </div>

            {/* Links Card */}
            {(project.project_url || project.github_url) && (
              <div style={{
                background: '#fff',
                border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: 14,
                padding: '22px 24px',
                marginBottom: 14,
              }}>
                <p style={{ fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  Linklər
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px', borderRadius: 9,
                        border: '0.5px solid rgba(0,0,0,0.1)',
                        background: '#F8F7F4',
                        color: '#1A1916', fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      <Globe size={14} color="#185FA5" />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.project_url.replace(/^https?:\/\//, '')}
                      </span>
                      <ExternalLink size={12} color="#888780" />
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px', borderRadius: 9,
                        border: '0.5px solid rgba(0,0,0,0.1)',
                        background: '#F8F7F4',
                        color: '#1A1916', fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      <Github size={14} />
                      <span style={{ flex: 1 }}>GitHub</span>
                      <ExternalLink size={12} color="#888780" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Tech quick-list in sidebar */}
            {project.technologies_list.length > 0 && (
              <div style={{
                background: '#fff',
                border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: 14,
                padding: '22px 24px',
              }}>
                <p style={{ fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  Stack
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {project.technologies_list.map(t => (
                    <span
                      key={t}
                      style={{
                        background: '#F1EFE8', borderRadius: 6,
                        border: '0.5px solid rgba(0,0,0,0.08)',
                        padding: '4px 10px', fontSize: 12,
                        color: '#5F5E5A', fontFamily: 'ui-monospace, monospace',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          main > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
        a:hover { opacity: 0.85; }
        button:hover { opacity: 0.85; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ─── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      fontSize: 12, color: '#888780',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 10,
    }}>
      {icon}
      {text}
    </div>
  )
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const sk = (w: string, h: number, r = 8) => (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #E8E6DC 25%, #F1EFE8 50%, #E8E6DC 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', padding: '58px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ padding: '44px 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sk('120px', 24, 12)}
          {sk('70%', 44, 10)}
          {sk('50%', 20, 8)}
        </div>
        {sk('100%', 460, 16)}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#F8F7F4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, textAlign: 'center',
    }}>
      <Code2 size={40} color="#D3D1C7" />
      <h2 style={{ fontWeight: 500, fontSize: 22, color: '#1A1916' }}>Proyekt tapılmadı</h2>
      <p style={{ color: '#888780', fontSize: 14 }}>Bu proyekt mövcud deyil və ya silinib.</p>
      <button
        onClick={onBack}
        style={{
          marginTop: 8,
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '10px 20px', borderRadius: 10,
          background: '#1A1916', color: '#fff',
          fontSize: 14, border: 'none', cursor: 'pointer',
        }}
      >
        <ArrowLeft size={15} /> Ana səhifəyə qayıt
      </button>
    </div>
  )
}