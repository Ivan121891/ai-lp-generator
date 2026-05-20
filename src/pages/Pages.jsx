import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { getDefaultSectionsForPage } from '../data/sections'

export default function Pages() {
  const { pages, removePage, apiKey, locations, addPage } = useApp()
  const navigate = useNavigate()
  const [showGenerator, setShowGenerator] = useState(false)

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Landing pages</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and manage AI-powered landing pages</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const blank = {
                id: crypto.randomUUID(),
                title: 'Untitled page',
                prompt: '',
                html: '',
                sections: getDefaultSectionsForPage(),
                emoji: '📄',
                createdAt: new Date().toISOString(),
                views: 0,
                bookings: 0,
                locationId: null,
              }
              addPage(blank)
              navigate(`/pages/${blank.id}`)
            }}
            className="bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            + Blank page
          </button>
          <button
            onClick={() => {
              if (!apiKey) {
                navigate('/settings')
                return
              }
              setShowGenerator(true)
            }}
            className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
          >
            ✨ AI Generate
          </button>
        </div>
      </div>

      {showGenerator && (
        <GeneratorPanel onClose={() => setShowGenerator(false)} onGenerated={(id) => {
          setShowGenerator(false)
          navigate(`/pages/${id}`)
        }} />
      )}

      {/* Pages list */}
      <div className="space-y-2">
        {pages.length === 0 && !showGenerator && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No pages yet</h3>
            <p className="text-sm text-gray-400 mb-4">Build from scratch with the Designer, or use AI to generate one</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const blank = {
                    id: crypto.randomUUID(),
                    title: 'Untitled page',
                    prompt: '',
                    html: '',
                    sections: getDefaultSectionsForPage(),
                    emoji: '📄',
                    createdAt: new Date().toISOString(),
                    views: 0, bookings: 0, locationId: null,
                  }
                  addPage(blank)
                  navigate(`/pages/${blank.id}`)
                }}
                className="bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                + Blank page
              </button>
              <button
                onClick={() => {
                  if (!apiKey) { navigate('/settings'); return }
                  setShowGenerator(true)
                }}
                className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
              >
                ✨ AI Generate
              </button>
            </div>
          </div>
        )}

        {pages.map(page => (
          <div
            key={page.id}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
                {page.emoji || '📄'}
              </div>
              <div className="min-w-0">
                <Link to={`/pages/${page.id}`} className="text-sm font-medium text-gray-900 hover:text-[#d85a30]">
                  {page.title || 'Untitled'}
                </Link>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{page.views || 0} views</span>
                  <span>·</span>
                  <span>{page.bookings || 0} leads</span>
                  {(() => {
                    const loc = locations.find(l => l.id === page.locationId)
                    return loc ? <><span>·</span><span className="text-green-600">🔗 {loc.displayName}</span></> : null
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Link
                to={`/pages/${page.id}`}
                className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => removePage(page.id)}
                className="px-4 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GeneratorPanel({ onClose, onGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const { addPage, apiKey, settings, locations } = useApp()

  const samplePrompts = [
    'A clean landing page for a skincare clinic with hero, services, testimonials, and booking CTA',
    'A modern SaaS landing page: hero with animation, features grid, pricing tiers, FAQ',
    'A luxury real estate landing page: full-bleed hero, property gallery, agent bio, contact form',
    'A fitness coaching landing page with before/after photos, program tiers, signup CTA',
  ]

  const handleGenerate = async (customPrompt) => {
    const p = customPrompt || prompt
    if (!p.trim()) return
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
              content: `You are an expert landing page designer and frontend developer. Generate a complete, beautiful HTML landing page based on the user's description.

Requirements:
- Use Tailwind CSS via CDN (script tag from cdn.tailwindcss.com)
- Single HTML file, fully self-contained
- Modern, conversion-optimized design with smooth animations
- Mobile responsive
- Include all sections: hero, features/services, testimonials, CTA, footer
- Use the brand colors: accent=${settings.accentColor}, bg=${settings.bgColor}, text=${settings.textColor}
- Corner radius style: ${settings.cornerRadius}px
- Include placeholder images from picsum.photos
- The page should look professional and ready to publish
- Output ONLY the complete HTML code, no markdown fences, no explanations`
            },
            { role: 'user', content: p.trim() }
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
      })

      const data = await res.json()
      if (data.error) {
        throw new Error(data.error.message || 'API error')
      }

      let html = data.choices[0].message.content
      // Remove markdown code fences if present
      html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim()

      const id = crypto.randomUUID()
      addPage({
        id,
        title: p.trim().split('.')[0].slice(0, 60),
        prompt: p.trim(),
        html,
        sections: getDefaultSectionsForPage(),
        emoji: '📄',
        model: settings.model,
        accentColor: settings.accentColor,
        cornerRadius: settings.cornerRadius,
        locationId: selectedLocation || null,
      })
      onGenerated(id)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Generate landing page</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg">✕</button>
      </div>

      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe the landing page you want... (e.g., 'A modern landing page for a vegan bakery with hero, menu, testimonials, and order CTA')"
          className="w-full h-24 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#d85a30]"
        />
      </div>

      {/* Location selector */}
      {locations.length > 0 && (
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Connect to GHL location (optional)</label>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
          >
            <option value="">— None (standalone page) —</option>
            {locations.filter(l => l.status === 'active').map(loc => (
              <option key={loc.id} value={loc.id}>{loc.displayName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sample prompts */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Quick prompts:</div>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((sp, i) => (
            <button
              key={i}
              onClick={() => handleGenerate(sp)}
              disabled={generating}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {sp.slice(0, 50)}…
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => handleGenerate()}
          disabled={generating || !prompt.trim()}
          className="flex items-center gap-2 bg-[#d85a30] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {generating ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              Generating...
            </>
          ) : (
            '✨ Generate page'
          )}
        </button>
        {generating && (
          <div className="text-xs text-gray-400 self-center">This may take 15-30 seconds...</div>
        )}
      </div>
    </div>
  )
}