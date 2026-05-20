import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import DesignerPanel from '../components/sections/DesignerPanel'
import SectionRenderer from '../components/sections/SectionRenderer'
import HeroSection from '../components/sections/HeroSection'
import ServicesSection from '../components/sections/ServicesSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import StatsSection from '../components/sections/StatsSection'
import FaqSection from '../components/sections/FaqSection'
import CtaSection from '../components/sections/CtaSection'
import FooterSection from '../components/sections/FooterSection'
import { getDefaultSectionsForPage, generateCSS } from '../data/sections'

export default function PageEditor() {
  const { id } = useParams()
  const { pages, updatePage, apiKey, settings } = useApp()
  const navigate = useNavigate()
  const page = pages.find(p => p.id === id)
  const [activeTab, setActiveTab] = useState('Designer')
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  if (!page) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Page not found</h2>
          <p className="text-sm text-gray-400 mb-4">This page doesn't exist or was deleted</p>
          <Link to="/pages" className="text-[#d85a30] text-sm hover:underline">Back to pages</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3 text-sm">
          <Link to="/pages" className="text-gray-400 hover:text-gray-600">Pages</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{page.title || 'Untitled'}</span>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-100 text-yellow-700 rounded-full">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 rounded-lg px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Real-time</span>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            👁 Preview
          </button>
          <button
            onClick={() => {
              const html = generateStaticHtml(page, settings)
              const blob = new Blob([html], { type: 'text/html' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${(page.title || 'page').replace(/\s+/g, '-').toLowerCase()}.html`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            ⬇ Export HTML
          </button>
          <span className="text-xs text-gray-300 mx-1">|</span>
          <span className="text-xs text-gray-400 font-mono">/{page.id?.slice(0, 8)}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Device toggle */}
          <div className="flex items-center gap-3 px-6 py-2 border-b border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-400 font-medium">
              {activeTab === 'Designer' ? 'LIVE PREVIEW — Click any section to edit' : 'HTML PREVIEW'}
            </span>
          </div>
          {/* Preview */}
          <div className="flex-1 bg-gray-100 overflow-auto">
            {activeTab === 'Designer' ? (
              <div className="min-h-full">
                <SectionRenderer
                  sections={page.sections || getDefaultSectionsForPage()}
                  css={generateCSS({ ...settings, accentColor: page.accentColor || settings.accentColor, cornerRadius: page.cornerRadius || settings.cornerRadius })}
                  onSelectSection={setSelectedSectionId}
                  selectedSectionId={selectedSectionId}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mx-auto max-w-4xl my-4">
                {page.html ? (
                  <iframe
                    srcDoc={page.html}
                    title="Landing page preview"
                    className="w-full h-[2000px] border-0"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    No generated content yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-96 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <TabPanel
            page={page}
            updatePage={updatePage}
            apiKey={apiKey}
            navigate={navigate}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={settings}
          />
        </div>
      </div>
    </div>
  )
}

const TABS = ['Designer', 'Content', 'Style', 'Prompt']

function TabPanel({ page, updatePage, apiKey, navigate, activeTab, setActiveTab, settings }) {

  return (
    <>
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === tab
                ? 'text-[#d85a30] border-b-2 border-[#d85a30]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'Designer' && <DesignerPanel page={page} updatePage={updatePage} settings={settings} />}
        {activeTab === 'Content' && <div className="p-5"><ContentTab page={page} updatePage={updatePage} /></div>}
        {activeTab === 'Style' && <div className="p-5"><StyleTab page={page} updatePage={updatePage} /></div>}
        {activeTab === 'Prompt' && <div className="p-5"><PromptTab page={page} updatePage={updatePage} apiKey={apiKey} navigate={navigate} /></div>}
      </div>
    </>
  )
}

function ContentTab({ page, updatePage }) {
  const [title, setTitle] = useState(page.title || '')
  const [emoji, setEmoji] = useState(page.emoji || '📄')
  const { locations, domains } = useApp()
  const connectedLocation = locations.find(l => l.id === page.locationId)
  const linkedDomain = domains.find(d => d.pageId === page.id)

  const handleSave = () => {
    updatePage(page.id, { title, emoji })
  }

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-900">Page Details</h3>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Emoji</label>
        <input
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
          maxLength={2}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Prompt used</label>
        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{page.prompt || '—'}</div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Status</label>
        <span className="px-2 py-1 text-[10px] font-medium bg-yellow-100 text-yellow-700 rounded-full">Draft</span>
      </div>

      {/* GHL Location connection */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">GHL Location</label>
        {connectedLocation ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span>{connectedLocation.displayName}</span>
            <span className="text-green-400">({connectedLocation.ghlLocationId})</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">Not connected</div>
        )}
      </div>

      {/* Custom domain link */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Custom Domain</label>
        {linkedDomain ? (
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              linkedDomain.status === 'verified' ? 'bg-green-500' : 'bg-yellow-400'
            }`} />
            <span className="font-mono">{linkedDomain.domain}</span>
            <span className="text-blue-400 text-xs capitalize">({linkedDomain.status})</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
            No domain linked —{' '}
            <a href="/domains" className="text-[#d85a30] hover:underline">add one</a>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#d85a30] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
      >
        Save changes
      </button>
    </div>
  )
}

function StyleTab({ page, updatePage }) {
  const [accentColor, setAccentColor] = useState(page.accentColor || '#d85a30')
  const [bgColor, setBgColor] = useState(page.bgColor || '#ffffff')
  const [textColor, setTextColor] = useState(page.textColor || '#1a1a1a')
  const [cornerRadius, setCornerRadius] = useState(page.cornerRadius || 14)

  const accentPresets = ['#d85a30', '#1D9E75', '#D4537E', '#378ADD', '#FF3B00', '#0A0A0A']
  const bgPresets = ['#ffffff', '#f4f3ef', '#0a0a0a']

  const handleApply = () => {
    updatePage(page.id, { accentColor, bgColor, textColor, cornerRadius })
  }

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-900">Design Tokens</h3>

      {/* Accent presets */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Accent presets</label>
        <div className="flex gap-2">
          {accentPresets.map(color => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                accentColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Accent */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Accent</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
          />
          <span className="text-sm text-gray-600 font-mono">{accentColor}</span>
        </div>
      </div>

      {/* Background presets */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Background presets</label>
        <div className="flex gap-2">
          {bgPresets.map(color => (
            <button
              key={color}
              onClick={() => setBgColor(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                bgColor === color ? 'border-gray-900 scale-110' : color === '#ffffff' ? 'border-gray-200' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Background */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Background</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={bgColor}
            onChange={e => setBgColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
          />
          <span className="text-sm text-gray-600 font-mono">{bgColor}</span>
        </div>
      </div>

      {/* Text color */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Text</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={textColor}
            onChange={e => setTextColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
          />
          <span className="text-sm text-gray-600 font-mono">{textColor}</span>
        </div>
      </div>

      {/* Corner radius */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Corner radius (px)</label>
        <input
          type="range"
          min="0"
          max="24"
          value={cornerRadius}
          onChange={e => setCornerRadius(Number(e.target.value))}
          className="w-full accent-[#d85a30]"
        />
        <div className="text-sm text-gray-600 font-mono mt-1">{cornerRadius}px</div>
      </div>

      <button
        onClick={handleApply}
        className="w-full bg-[#d85a30] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
      >
        Apply style
      </button>

      <p className="text-[11px] text-gray-400">
        Note: Style changes apply to newly generated pages. To update an existing page, regenerate with the new style.
      </p>
    </div>
  )
}

function PromptTab({ page, updatePage, apiKey, navigate }) {
  const [prompt, setPrompt] = useState(page.prompt || '')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const { settings } = useApp()

  const handleRegenerate = async () => {
    if (!prompt.trim()) return
    if (!apiKey) {
      navigate('/settings')
      return
    }
    setGenerating(true)
    setError('')

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model || 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert landing page designer. Generate a complete HTML landing page with Tailwind CSS (CDN). 

Style: accent=${page.accentColor || settings.accentColor}, bg=${page.bgColor || settings.bgColor}, corner radius=${page.cornerRadius || settings.cornerRadius}px.
Include: hero, features, testimonials, CTA. Mobile responsive. Use picsum.photos for images.
Output ONLY the complete HTML — no markdown fences, no explanations.`
            },
            { role: 'user', content: prompt.trim() }
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error.message || 'API error')

      let html = data.choices[0].message.content
      html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim()

      updatePage(page.id, {
        html,
        title: prompt.trim().split('.')[0].slice(0, 60),
        prompt: prompt.trim(),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Regenerate with AI</h3>
      <p className="text-xs text-gray-400">
        Edit the prompt below to change the direction, then regenerate the page.
      </p>

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#d85a30]"
        placeholder="Describe what you want this landing page to look like..."
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleRegenerate}
        disabled={generating || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 bg-[#d85a30] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {generating ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            Regenerating...
          </>
        ) : (
          '🔄 Regenerate'
        )}
      </button>
    </div>
  )
}

/* ====== Full-screen Preview Modal ====== */
function PreviewModal({ page, settings, onClose }) {
  const sections = page.sections || getDefaultSectionsForPage()
  const css = generateCSS({ ...settings, accentColor: page.accentColor || settings.accentColor, cornerRadius: page.cornerRadius || settings.cornerRadius })

  const sectionComponents = {
    hero: HeroSection,
    services: ServicesSection,
    testimonials: TestimonialsSection,
    stats: StatsSection,
    faq: FaqSection,
    cta: CtaSection,
    footer: FooterSection,
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-gray-900">{page.title || 'Untitled'}</span>
          <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-xs font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            ✕ Close preview
          </button>
        </div>
      </div>
      {/* Preview content — scrollable, full width */}
      <div className="flex-1 overflow-y-auto">
        <div className="font-sans antialiased">
          {sections.filter(s => s.visible !== false).map(section => {
            const Component = sectionComponents[section.type]
            if (!Component) return null
            return <Component key={section.id} content={section.content} css={css} />
          })}
        </div>
      </div>
    </div>
  )
}

/* ====== Generate static HTML from sections ====== */
export function generateStaticHtml(page, settings) {
  const sections = page.sections || getDefaultSectionsForPage()
  const css = generateCSS({ ...settings, accentColor: page.accentColor || settings.accentColor, cornerRadius: page.cornerRadius || settings.cornerRadius })
  const visible = sections.filter(s => s.visible !== false)

  const sectionComponentsHtml = {
    hero: (c) => `<section style="min-height:85vh;display:flex;align-items:center;overflow:hidden;background:linear-gradient(135deg,#1a1a1a 0%,#2a2418 50%,#1a1a1a 100%);padding:0 1.5rem">
      <div style="max-width:1200px;margin:0 auto;width:100%;position:relative;z-index:10">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center">
          <div>
            ${c.showBadge ? `<div style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.375rem 1rem;background:rgba(255,255,255,0.05);border:1px solid ${css.accent}30;border-radius:9999px;font-size:0.75rem;font-weight:600;text-transform:uppercase;color:${css.accent}">✦ ${c.badgeText}</div>` : ''}
            <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.1;color:#ffffff;margin:1.5rem 0">${c.headline}</h1>
            ${c.subtext ? `<p style="font-size:1.125rem;color:rgba(255,255,255,0.6);max-width:500px;margin-bottom:2rem">${c.subtext}</p>` : ''}
            <div style="display:flex;gap:1rem;flex-wrap:wrap">
              ${c.primaryCta ? `<a href="#" style="display:inline-flex;align-items:center;gap:0.5rem;background:${css.accent};color:white;padding:0.75rem 2rem;border-radius:${css.radius};font-size:0.875rem;font-weight:600;text-decoration:none">${c.primaryCta}</a>` : ''}
              ${c.secondaryCta ? `<a href="#" style="display:inline-flex;align-items:center;gap:0.5rem;color:rgba(255,255,255,0.8);padding:0.75rem 2rem;border-radius:${css.radius};font-size:0.875rem;font-weight:600;border:1px solid rgba(255,255,255,0.2);text-decoration:none">${c.secondaryCta}</a>` : ''}
            </div>
          </div>
          ${c.image ? `<div style="position:relative"><img src="${c.image}" style="width:100%;height:500px;object-fit:cover;border-radius:${css.radius};box-shadow:0 25px 50px rgba(0,0,0,0.3)" /></div>` : ''}
        </div>
      </div>
    </section>`,

    services: (c) => `<section style="padding:6rem 1.5rem;background:#faf8f5">
      <div style="max-width:1200px;margin:0 auto">
        <div style="text-align:center;margin-bottom:4rem">
          <span style="display:inline-block;padding:0.375rem 1rem;background:${css.accent}15;color:${css.accent};border-radius:9999px;font-size:0.75rem;font-weight:600;text-transform:uppercase">Our Treatments</span>
          <h2 style="font-size:2rem;font-weight:700;color:#1a1a1a;margin-top:1rem">${c.heading}</h2>
          ${c.subtext ? `<p style="color:#666;max-width:600px;margin:0.5rem auto 0">${c.subtext}</p>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem">
          ${(c.items || []).map(item => `<div style="background:white;border-radius:${css.radius};overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
            <div style="height:192px;overflow:hidden"><img src="${item.image}" style="width:100%;height:100%;object-fit:cover" /></div>
            <div style="padding:1.5rem">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <h3 style="font-size:1.125rem;font-weight:600;color:#1a1a1a">${item.title}</h3>
                <span style="font-weight:700;font-size:1.125rem;color:${css.accent}">${item.price}</span>
              </div>
              <p style="font-size:0.875rem;color:#666;margin-top:0.75rem">${item.description}</p>
              ${(item.bullets || []).length > 0 ? `<ul style="margin-top:0.75rem;font-size:0.75rem;color:#999;list-style:none;padding:0">${item.bullets.map(b => `<li style="padding:0.25rem 0">✦ ${b}</li>`).join('')}</ul>` : ''}
              <a href="#" style="display:block;text-align:center;background:${css.accent};color:white;padding:0.625rem;border-radius:${css.radius};font-size:0.875rem;font-weight:600;text-decoration:none;margin-top:1rem">Book Now</a>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>`,

    testimonials: (c) => `<section style="padding:6rem 1.5rem;background:white">
      <div style="max-width:1200px;margin:0 auto">
        <div style="text-align:center;margin-bottom:4rem">
          <span style="display:inline-block;padding:0.375rem 1rem;background:${css.accent}15;color:${css.accent};border-radius:9999px;font-size:0.75rem;font-weight:600;text-transform:uppercase">Real Reviews</span>
          <h2 style="font-size:2rem;font-weight:700;color:#1a1a1a;margin-top:1rem">${c.heading}</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem">
          ${(c.items || []).map(item => `<div style="padding:1.5rem;background:#faf8f5;border-radius:${css.radius}">
            <div style="color:${css.accent}">${'★'.repeat(item.rating || 5)}</div>
            <p style="font-size:0.875rem;color:#666;margin:1rem 0;line-height:1.6">"${item.quote}"</p>
            <div style="display:flex;align-items:center;gap:0.75rem">
              <div style="width:2.5rem;height:2.5rem;border-radius:9999px;background:linear-gradient(135deg,${css.accent},${css.accentLight});display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">${item.initials || item.name?.charAt(0)}</div>
              <div><div style="font-size:0.875rem;font-weight:600;color:#1a1a1a">${item.name}</div><div style="font-size:0.75rem;color:#999">${item.service}</div></div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>`,

    stats: (c) => `<section style="padding:5rem 1.5rem;background:#1a1a1a">
      <div style="max-width:1200px;margin:0 auto;text-align:center">
        <h2 style="font-size:2rem;font-weight:700;color:white">${c.heading}</h2>
        ${c.subtext ? `<p style="color:rgba(255,255,255,0.6);margin-top:0.5rem">${c.subtext}</p>` : ''}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;margin-top:3rem">
          ${(c.items || []).map(item => `<div><div style="font-size:2rem;font-weight:700;color:${css.accent}">${item.value}</div><div style="font-size:0.875rem;color:rgba(255,255,255,0.4)">${item.label}</div></div>`).join('')}
        </div>
      </div>
    </section>`,

    faq: (c) => `<section style="padding:6rem 1.5rem;background:#faf8f5">
      <div style="max-width:768px;margin:0 auto">
        <div style="text-align:center;margin-bottom:2rem">
          <span style="display:inline-block;padding:0.375rem 1rem;background:${css.accent}15;color:${css.accent};border-radius:9999px;font-size:0.75rem;font-weight:600;text-transform:uppercase">FAQ</span>
          <h2 style="font-size:2rem;font-weight:700;color:#1a1a1a;margin-top:1rem">${c.heading}</h2>
        </div>
        ${(c.items || []).map((item, i) => `<details style="background:white;border-radius:${css.radius};margin-bottom:0.75rem;padding:1.25rem;cursor:pointer">
          <summary style="font-size:0.875rem;font-weight:600;color:#1a1a1a;list-style:none;display:flex;justify-content:space-between">${item.question}<span style="color:${css.accent}">▼</span></summary>
          <p style="font-size:0.875rem;color:#666;margin-top:0.75rem;line-height:1.6">${item.answer}</p>
        </details>`).join('')}
      </div>
    </section>`,

    cta: (c) => `<section style="padding:6rem 1.5rem;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0"><img src="${c.bgImage}" style="width:100%;height:100%;object-fit:cover" /><div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.8),rgba(0,0,0,0.6),rgba(0,0,0,0.8))"></div></div>
      <div style="position:relative;z-index:10;max-width:768px;margin:0 auto;text-align:center;color:white">
        <h2 style="font-size:clamp(1.5rem,3vw,2.5rem);font-weight:700;line-height:1.15">${c.headline}</h2>
        ${c.subtext ? `<p style="font-size:1.125rem;color:rgba(255,255,255,0.7);margin:1rem auto;max-width:600px">${c.subtext}</p>` : ''}
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem">
          ${c.primaryCta ? `<a href="#" style="display:inline-flex;align-items:center;gap:0.5rem;background:${css.accent};color:white;padding:0.75rem 2rem;border-radius:${css.radius};font-size:0.875rem;font-weight:600;text-decoration:none">${c.primaryCta}</a>` : ''}
          ${c.secondaryCta ? `<a href="#" style="display:inline-flex;align-items:center;gap:0.5rem;color:rgba(255,255,255,0.8);padding:0.75rem 2rem;border-radius:${css.radius};font-size:0.875rem;font-weight:600;border:1px solid rgba(255,255,255,0.2);text-decoration:none">${c.secondaryCta}</a>` : ''}
        </div>
      </div>
    </section>`,

    footer: (c) => `<footer style="padding:3rem 1.5rem;background:#1a1a1a">
      <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:2rem">
        <div><div style="font-size:1.125rem;font-weight:700;color:white;margin-bottom:0.75rem">${c.brand}</div><p style="font-size:0.75rem;color:rgba(255,255,255,0.6);line-height:1.6">${c.tagline}</p></div>
        <div><h4 style="color:white;font-size:0.875rem;font-weight:600;margin-bottom:0.75rem">Quick Links</h4><ul style="list-style:none;padding:0;font-size:0.75rem;color:rgba(255,255,255,0.6)">${(c.links || []).map(l => `<li style="margin-bottom:0.5rem"><a href="${l.href}" style="color:rgba(255,255,255,0.6);text-decoration:none">${l.label}</a></li>`).join('')}</ul></div>
        <div><h4 style="color:white;font-size:0.875rem;font-weight:600;margin-bottom:0.75rem">Contact</h4><ul style="list-style:none;padding:0;font-size:0.75rem;color:rgba(255,255,255,0.6)">${c.address ? `<li style="margin-bottom:0.5rem">📍 ${c.address}</li>` : ''}${c.phone ? `<li style="margin-bottom:0.5rem">📞 ${c.phone}</li>` : ''}${c.email ? `<li style="margin-bottom:0.5rem">✉️ ${c.email}</li>` : ''}${c.hours ? `<li>🕐 ${c.hours}</li>` : ''}</ul></div>
      </div>
      <div style="max-width:1200px;margin:2rem auto 0;padding-top:2rem;border-top:1px solid rgba(255,255,255,0.1);text-align:center;font-size:0.75rem;color:rgba(255,255,255,0.4)">
        © 2025 ${c.brand}. All rights reserved.
      </div>
    </footer>`,
  }

  const sectionsHtml = visible.map(s => {
    const fn = sectionComponentsHtml[s.type]
    return fn ? fn(s.content) : ''
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.title || 'Landing Page'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  </style>
</head>
<body>
${sectionsHtml}
</body>
</html>`
}