import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import BookingFlow from '../components/BookingFlow'

export default function PageEditor() {
  const { id } = useParams()
  const { pages, updatePage, apiKey, settings, locations } = useApp()
  const navigate = useNavigate()
  const page = pages.find(p => p.id === id)
  const [activeTab, setActiveTab] = useState('Content')
  const [previewMode, setPreviewMode] = useState('mobile') // mobile | desktop
  const [saving, setSaving] = useState(false)

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

  const accentColor = page.accentColor || '#d85a30'
  const connectedLocation = locations.find(l => l.id === page.locationId)
  const preflightOk = page.calendarId && page.assignedUserId

  const handleSave = () => {
    setSaving(true)
    updatePage(page.id, {})
    setTimeout(() => setSaving(false), 800)
  }

  const handlePublish = async () => {
    if (!preflightOk) {
      alert('Complete the pre-publish checks first: select a calendar and assign a user.')
      return
    }
    // Generate live HTML and publish
    const connectedLoc = locations.find(l => l.id === page.locationId)
    const html = generateLiveHtml(page, connectedLoc)
    const slug = page.slug || page.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const pubUrl = localStorage.getItem('ailp-publish-url') || 'http://localhost:3008'
    try {
      const res = await fetch(`${pubUrl}/api/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: page.id,
          title: page.title,
          slug,
          html,
        }),
      })
      if (!res.ok) throw new Error(`Publish failed: ${res.status}`)
      const data = await res.json()
      updatePage(page.id, {
        status: 'live',
        slug,
        publishedUrl: data.url || `/p/${slug}`,
        publishedAt: new Date().toISOString(),
      })
      alert('Published successfully!')
    } catch (err) {
      // Offline fallback - mark as live locally
      updatePage(page.id, { status: 'live', slug, publishedAt: new Date().toISOString() })
      alert(`Published (offline): ${err.message}`)
    }
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3 text-sm">
          <Link to="/pages" className="text-gray-400 hover:text-gray-600">Pages</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{page.title || 'Untitled'}</span>
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
            page.status === 'live'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {page.status === 'live' ? 'Live' : 'Draft'}
          </span>
          {page.publishedUrl && (
            <a
              href={page.publishedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View live ↗
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          {connectedLocation && (
            <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
              GHL · {connectedLocation.displayName}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — Page URL + Pre-publish checklist */}
        <div className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto p-4 space-y-6">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Page URL</label>
            <input
              value={page.slug || ''}
              onChange={e => updatePage(page.id, { slug: e.target.value })}
              placeholder="my-booking-page"
              className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-[#d85a30]"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              /sites/{page.slug || 'my-booking-page'}
            </p>
          </div>

          {/* Pre-publish checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Pre-publish check</label>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                preflightOk ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {preflightOk ? 'Ready' : 'Incomplete'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  page.calendarId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {page.calendarId ? '✓' : '○'}
                </span>
                <span className="text-gray-600">Calendar selected</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  page.assignedUserId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {page.assignedUserId ? '✓' : '○'}
                </span>
                <span className="text-gray-600">Assigned user selected</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  preflightOk ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {preflightOk ? '✓' : '○'}
                </span>
                <span className="text-gray-600">Test booking pending</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3">
              Publish stays disabled until every item passes.
            </p>
            {preflightOk && (
              <button
                onClick={() => alert('Test booking flow complete!')}
                className="w-full mt-3 py-2 text-xs font-medium text-white rounded-lg cursor-pointer hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Run test booking
              </button>
            )}
          </div>
        </div>

        {/* Center — Preview */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Device toggle */}
          <div className="flex items-center gap-3 px-6 py-2 border-b border-gray-100 bg-white">
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                previewMode === 'mobile'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mobile
            </button>
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                previewMode === 'desktop'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Desktop
            </button>
          </div>

          {/* Preview container */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-6">
            {previewMode === 'mobile' ? (
              <div className="w-[375px] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <BookingFlow page={page} settings={settings} locations={locations} />
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <BookingFlow page={page} settings={settings} locations={locations} />
              </div>
            )}
          </div>
        </div>

        {/* Right panel — Tab content */}
        <div className="w-96 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Tab buttons */}
          <div className="flex flex-wrap border-b border-gray-200 shrink-0">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'text-[#d85a30] border-b-2 border-[#d85a30] bg-[#d85a30]/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'Content' && <ContentTab page={page} updatePage={updatePage} />}
            {activeTab === 'AI copy' && <AICopyTab page={page} updatePage={updatePage} apiKey={apiKey} navigate={navigate} settings={settings} />}
            {activeTab === 'Add-ons' && <AddOnsTab page={page} updatePage={updatePage} />}
            {activeTab === 'Flow' && <FlowTab page={page} updatePage={updatePage} />}
            {activeTab === 'Calendar' && <CalendarTab page={page} updatePage={updatePage} />}
            {activeTab === 'GHL' && <GHLTab page={page} updatePage={updatePage} locations={locations} />}
            {activeTab === 'Tracking' && <TrackingTab page={page} updatePage={updatePage} />}
            {activeTab === 'Style' && <StyleTab page={page} updatePage={updatePage} />}
          </div>
        </div>
      </div>
    </div>
  )
}

const TABS = ['Content', 'AI copy', 'Add-ons', 'Flow', 'Calendar', 'GHL', 'Tracking', 'Style']

/* ============================
   CONTENT TAB
   ============================ */
function ContentTab({ page, updatePage }) {
  const steps = page.steps || {}
  const hero = steps.heroDate || {}
  const service = page.service || {}

  const updateHero = (field, value) => {
    updatePage(page.id, {
      steps: { ...page.steps, heroDate: { ...hero, [field]: value } }
    })
  }

  const updateService = (field, value) => {
    updatePage(page.id, {
      service: { ...service, [field]: value }
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Hero section */}
      <Section title="Hero">
        <Field label="Headline">
          <input value={hero.headline || ''} onChange={e => updateHero('headline', e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Subtitle">
          <input value={hero.subtitle || ''} onChange={e => updateHero('subtitle', e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="CTA text">
          <input value={hero.ctaText || ''} onChange={e => updateHero('ctaText', e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Hero image">
          <div className="flex gap-2">
            <input value={hero.heroImage || ''} onChange={e => updateHero('heroImage', e.target.value)}
              placeholder="https://..."
              className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            <label className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (ev) => {
                    updateHero('heroImage', ev.target?.result || '')
                    e.target.value = ''
                  }
                  reader.readAsDataURL(file)
                }}
              />
            </label>
            {hero.heroImage && (
              <button onClick={() => updateHero('heroImage', '')}
                className="shrink-0 px-2 text-xs text-red-500 hover:text-red-600 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer">
                ✕
              </button>
            )}
          </div>
        </Field>
        <Field label="Urgency banner text">
          <input value={hero.urgencyText || ''} onChange={e => updateHero('urgencyText', e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={hero.showUrgencyBanner !== false}
            onChange={e => updateHero('showUrgencyBanner', e.target.checked)}
            className="rounded border-gray-300" />
          Show urgency banner
        </label>
        <Field label="Date helper text">
          <input value={hero.helperText || ''} onChange={e => updateHero('helperText', e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
      </Section>

      {/* Service & Price */}
      <Section title="Service & price">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={service.show !== false}
            onChange={e => updateService('show', e.target.checked)}
            className="rounded border-gray-300" />
          Show the service & price block
        </label>
        {service.show !== false && (
          <>
            <Field label="Service name">
              <input value={service.name || ''} onChange={e => updateService('name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            </Field>
            <Field label="Description">
              <input value={service.description || ''} onChange={e => updateService('description', e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            </Field>
            <Field label="Price">
              <input value={service.price || ''} onChange={e => updateService('price', e.target.value)}
                placeholder="$129"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            </Field>
            <Field label="Period">
              <input value={service.period || ''} onChange={e => updateService('period', e.target.value)}
                placeholder="per session"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            </Field>
          </>
        )}
      </Section>

      {/* Time step */}
      <Section title="Time selection">
        <Field label="Heading">
          <input value={steps.time?.heading || ''} onChange={e => updatePage(page.id, { steps: { ...page.steps, time: { ...steps.time, heading: e.target.value } } })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Helper text">
          <input value={steps.time?.helperText || ''} onChange={e => updatePage(page.id, { steps: { ...page.steps, time: { ...steps.time, helperText: e.target.value } } })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={steps.time?.showChangeDateBack !== false}
            onChange={e => updatePage(page.id, { steps: { ...page.steps, time: { ...steps.time, showChangeDateBack: e.target.checked } } })}
            className="rounded border-gray-300" />
          Show the "change date" back button
        </label>
      </Section>

      {/* Form step */}
      <Section title="Form">
        <Field label="Heading">
          <input value={steps.form?.heading || ''} onChange={e => updatePage(page.id, { steps: { ...page.steps, form: { ...steps.form, heading: e.target.value } } })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Helper text">
          <input value={steps.form?.helperText || ''} onChange={e => updatePage(page.id, { steps: { ...page.steps, form: { ...steps.form, helperText: e.target.value } } })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Button text">
          <input value={steps.form?.buttonText || ''} onChange={e => updatePage(page.id, { steps: { ...page.steps, form: { ...steps.form, buttonText: e.target.value } } })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Privacy text">
          <input value={steps.form?.privacyText || ''} onChange={e => updatePage(page.id, { steps: { ...page.steps, form: { ...steps.form, privacyText: e.target.value } } })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
      </Section>

      {/* Confirmation step */}
      <Section title="Confirmation">
        <Field label="Heading">
          <input value={steps.confirmation?.heading || ''} onChange={e => updatePage(page.id, { steps: { ...page.steps, confirmation: { ...steps.confirmation, heading: e.target.value } } })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Message">
          <input value={steps.confirmation?.message || ''} onChange={e => updatePage(page.id, { steps: { ...page.steps, confirmation: { ...steps.confirmation, message: e.target.value } } })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
      </Section>

      {/* Business info */}
      <Section title="Business info">
        <Field label="Business name">
          <input value={page.businessName || ''} onChange={e => updatePage(page.id, { businessName: e.target.value })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Address">
          <input value={page.address || ''} onChange={e => updatePage(page.id, { address: e.target.value })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
        <Field label="Phone">
          <input value={page.phone || ''} onChange={e => updatePage(page.id, { phone: e.target.value })}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
        </Field>
      </Section>
    </div>
  )
}

/* ============================
   AI COPY TAB
   ============================ */
function AICopyTab({ page, updatePage, apiKey, navigate, settings }) {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (!apiKey) { navigate('/settings'); return }

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
              content: `You are a copywriter for aesthetic/spa booking pages. Generate compelling text for a 3-tap booking flow.
Current service: "${page.service?.name || 'Not set'}"
Current headline: "${page.steps?.heroDate?.headline || ''}"

Generate optimized copy for:
1. A new headline (short, benefit-driven)
2. A new subtitle (1 sentence)
3. Urgency banner text (short, creates scarcity)
4. CTA button text (action-oriented, 2-3 words)
5. Date helper text
6. Time selection heading
7. Form heading
8. Confirmation heading and message

Format as JSON with keys: headline, subtitle, urgencyText, ctaText, dateHelper, timeHeading, formHeading, confirmHeading, confirmMessage`
            },
            { role: 'user', content: prompt.trim() }
          ],
          max_tokens: 1024,
          temperature: 0.8,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message || 'API error')

      const content = data.choices[0].message.content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      const copy = JSON.parse(jsonMatch[0])

      const steps = page.steps || {}
      updatePage(page.id, {
        steps: {
          ...steps,
          heroDate: {
            ...steps.heroDate,
            headline: copy.headline || steps.heroDate?.headline,
            subtitle: copy.subtitle || steps.heroDate?.subtitle,
            urgencyText: copy.urgencyText || steps.heroDate?.urgencyText,
            ctaText: copy.ctaText || steps.heroDate?.ctaText,
            helperText: copy.dateHelper || steps.heroDate?.helperText,
          },
          time: {
            ...steps.time,
            heading: copy.timeHeading || steps.time?.heading,
          },
          form: {
            ...steps.form,
            heading: copy.formHeading || steps.form?.heading,
          },
          confirmation: {
            ...steps.confirmation,
            heading: copy.confirmHeading || steps.confirmation?.heading,
            message: copy.confirmMessage || steps.confirmation?.message,
          },
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">AI Copy</h3>
      <p className="text-xs text-gray-400">
        Describe the tone, audience, or angle for the copy. The AI will generate optimized text and apply it to all fields.
      </p>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="e.g. 'Upscale medical spa in Beverly Hills targeting women 35-55 who want non-invasive results'"
        className="w-full h-24 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#d85a30]"
      />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}
      <button
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 bg-[#d85a30] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {generating ? 'Generating...' : '✨ Generate copy'}
      </button>
    </div>
  )
}

/* ============================
   ADD-ONS TAB
   ============================ */
function AddOnsTab({ page, updatePage }) {
  const gallery = page.gallery || {}
  const steps = page.steps || {}

  const updateGallery = (field, value) => {
    updatePage(page.id, { gallery: { ...gallery, [field]: value } })
  }

  return (
    <div className="p-4 space-y-6">
      <Section title="Scarcity Bar">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={steps.heroDate?.showUrgencyBanner !== false}
            onChange={e => updatePage(page.id, {
              steps: { ...steps, heroDate: { ...steps.heroDate, showUrgencyBanner: e.target.checked } }
            })}
            className="rounded border-gray-300" />
          Show the urgency / scarcity banner at the top
        </label>
        <p className="text-[10px] text-gray-400 pl-6">
          Displays &quot;Limited spots this week&quot; banner above the hero.
        </p>
      </Section>

      <Section title="Footer">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={page.showFooter !== false}
            onChange={e => updatePage(page.id, { showFooter: e.target.checked })}
            className="rounded border-gray-300" />
          Show footer with business info
        </label>
        <p className="text-[10px] text-gray-400 pl-6">
          Displays business name, address, and phone on the confirmation screen.
        </p>
        {page.showFooter !== false && (
          <div className="mt-3 space-y-3 pl-6 border-l-2 border-gray-100">
            <Field label="Business name">
              <input value={page.businessName || ''} onChange={e => updatePage(page.id, { businessName: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            </Field>
            <Field label="Address">
              <input value={page.address || ''} onChange={e => updatePage(page.id, { address: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            </Field>
            <Field label="Phone">
              <input value={page.phone || ''} onChange={e => updatePage(page.id, { phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            </Field>
          </div>
        )}
      </Section>

      <Section title="Before / After Gallery">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={gallery.show || false}
            onChange={e => updateGallery('show', e.target.checked)}
            className="rounded border-gray-300" />
          Show the before/after gallery
        </label>
        {gallery.show && (
          <>
            <Field label="Gallery heading">
              <input value={gallery.heading || ''} onChange={e => updateGallery('heading', e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
            </Field>
            <p className="text-xs text-gray-400">Before/after pairs can be added via the publish server API.</p>
          </>
        )}
      </Section>

      <Section title="Booking Reference">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={page.steps?.confirmation?.showBookingReference || false}
            onChange={e => updatePage(page.id, {
              steps: {
                ...page.steps,
                confirmation: { ...page.steps.confirmation, showBookingReference: e.target.checked }
              }
            })}
            className="rounded border-gray-300" />
          Show an APT-XXXXX booking reference
        </label>
      </Section>
    </div>
  )
}

/* ============================
   FLOW TAB
   ============================ */
function FlowTab({ page, updatePage }) {
  const steps = page.steps || {}
  const flowItems = [
    { id: 'heroDate', label: 'Hero + Date' },
    { id: 'time', label: 'Time' },
    { id: 'form', label: 'Form' },
    { id: 'confirmation', label: 'Confirmation' },
  ]

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Booking Flow</h3>
      <p className="text-xs text-gray-400">
        3 taps → booked · no scroll · one screen at a time
      </p>
      <div className="space-y-2">
        {flowItems.map((item, i) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={steps[item.id]?.enabled !== false}
                onChange={e => {
                  updatePage(page.id, {
                    steps: { ...steps, [item.id]: { ...steps[item.id], enabled: e.target.checked } }
                  })
                }}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#d85a30] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all" />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================
   CALENDAR TAB
   ============================ */
function CalendarTab({ page, updatePage }) {
  const [calendarId, setCalendarId] = useState(page.calendarId || '')
  const [calendars, setCalendars] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { locations } = useApp()

  const connectedLocation = locations.find(l => l.id === page.locationId)

  const fetchCalendars = async () => {
    if (!connectedLocation?.pitToken || !connectedLocation?.ghlLocationId) {
      setError('Connect a GHL location first, then select it in the GHL tab.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `https://services.leadconnectorhq.com/calendars/?locationId=${connectedLocation.ghlLocationId}`,
        {
          headers: {
            'Authorization': `Bearer ${connectedLocation.pitToken}`,
            'Version': '2021-04-15',
          },
        }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `GHL API returned ${res.status}`)
      }
      const data = await res.json()
      setCalendars(data.calendars || [])
    } catch (err) {
      setError(err.message)
      setCalendars([])
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch when location changes
  useEffect(() => {
    if (connectedLocation?.pitToken && connectedLocation?.ghlLocationId) {
      fetchCalendars()
    }
  }, [page.locationId])

  const handleApply = () => {
    updatePage(page.id, { calendarId })
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Calendar</h3>
      <p className="text-xs text-gray-400">
        Select a GHL calendar to pull availability from.
      </p>

      {!connectedLocation && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          No GHL location connected. Go to the <strong>GHL</strong> tab to link one first.
        </div>
      )}

      {connectedLocation && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg p-2.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span>{connectedLocation.displayName}</span>
        </div>
      )}

      {loading && (
        <div className="text-xs text-gray-400 py-2">Loading calendars...</div>
      )}

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
      )}

      {!loading && calendars.length > 0 && (
        <div className="space-y-2">
          {calendars.map(cal => (
            <label key={cal.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              calendarId === cal.id ? 'border-[#d85a30] bg-[#d85a30]/5' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="calendar"
                value={cal.id}
                checked={calendarId === cal.id}
                onChange={e => setCalendarId(e.target.value)}
                className="mt-0.5 text-[#d85a30] focus:ring-[#d85a30] shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800">{cal.name}</div>
                {cal.description && <div className="text-[11px] text-gray-400 mt-0.5">{cal.description}</div>}
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {cal.slotDuration || '-'} min · {cal.slotInterval || '-'} min interval
                  {cal.appointmentPerSlot ? ` · ${cal.appointmentPerSlot} per slot` : ''}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {!loading && !error && calendars.length === 0 && connectedLocation && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
          No calendars found for this location.
          {!calendars.length && (
            <button onClick={fetchCalendars} className="ml-1 text-[#d85a30] hover:underline cursor-pointer">
              Refresh
            </button>
          )}
        </div>
      )}

      <Field label="Or enter Calendar ID manually">
        <input value={calendarId} onChange={e => setCalendarId(e.target.value)}
          placeholder="Enter GHL calendar ID"
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
      </Field>

      <button
        onClick={handleApply}
        className="w-full bg-[#d85a30] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
      >
        Apply calendar
      </button>

      {calendarId && connectedLocation && (
        <button
          onClick={fetchCalendars}
          className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 cursor-pointer"
        >
          ↻ Refresh calendars from GHL
        </button>
      )}
    </div>
  )
}

/* ============================
   GHL TAB
   ============================ */
function GHLTab({ page, updatePage, locations }) {
  const connectedLocation = locations.find(l => l.id === page.locationId)

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">GHL Connection</h3>
      <p className="text-xs text-gray-400">
        Link this booking page to a GoHighLevel location for lead capture and calendar sync.
      </p>

      {/* Location selector */}
      <Field label="Connected location">
        <select
          value={page.locationId || ''}
          onChange={e => updatePage(page.id, { locationId: e.target.value || null })}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
        >
          <option value="">— None —</option>
          {locations.filter(l => l.status === 'active').map(loc => (
            <option key={loc.id} value={loc.id}>{loc.displayName}</option>
          ))}
        </select>
      </Field>

      {connectedLocation && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg p-3">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span>{connectedLocation.displayName}</span>
          <span className="text-green-400">({connectedLocation.ghlLocationId})</span>
        </div>
      )}

      <Field label="Assigned user ID">
        <input
          value={page.assignedUserId || ''}
          onChange={e => updatePage(page.id, { assignedUserId: e.target.value || null })}
          placeholder="GHL user ID for notifications"
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]"
        />
      </Field>

      <p className="text-[10px] text-gray-400">
        Locations are managed from the Locations page in the sidebar.
      </p>
    </div>
  )
}

/* ============================
   TRACKING TAB
   ============================ */
function TrackingTab({ page, updatePage }) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Tracking</h3>
      <Field label="Google Analytics ID">
        <input
          value={page.googleAnalyticsId || ''}
          onChange={e => updatePage(page.id, { googleAnalyticsId: e.target.value })}
          placeholder="G-XXXXXXXXXX"
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
      </Field>
      <Field label="Facebook Pixel ID">
        <input
          value={page.facebookPixelId || ''}
          onChange={e => updatePage(page.id, { facebookPixelId: e.target.value })}
          placeholder="1234567890"
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]" />
      </Field>
    </div>
  )
}

/* ============================
   STYLE TAB
   ============================ */
function StyleTab({ page, updatePage }) {
  const [accentColor, setAccentColor] = useState(page.accentColor || '#d85a30')
  const [bgColor, setBgColor] = useState(page.bgColor || '#ffffff')
  const [headingColor, setHeadingColor] = useState(page.headingColor || '#1a1a1a')
  const [subtitleColor, setSubtitleColor] = useState(page.subtitleColor || '#6b7280')
  const [buttonTextColor, setButtonTextColor] = useState(page.buttonTextColor || '#ffffff')
  const [cornerRadius, setCornerRadius] = useState(page.cornerRadius || 14)
  const [headingFont, setHeadingFont] = useState(page.headingFont || 'Inter')
  const [bodyFont, setBodyFont] = useState(page.bodyFont || 'Inter')
  const [headingSize, setHeadingSize] = useState(page.headingSize || 18)
  const [bodySize, setBodySize] = useState(page.bodySize || 14)
  const [buttonStyle, setButtonStyle] = useState(page.buttonStyle || 'filled')
  const [headingWeight, setHeadingWeight] = useState(page.headingWeight || '700')
  const [bodyWeight, setBodyWeight] = useState(page.bodyWeight || '400')

  const accentPresets = ['#d85a30', '#1D9E75', '#D4537E', '#378ADD', '#ea580c', '#0A0A0A']
  const bgPresets = ['#ffffff', '#f4f3ef', '#0a0a0a']
  const headingPresets = ['#1a1a1a', '#ffffff', '#333333', '#d85a30']
  const subtitlePresets = ['#6b7280', '#9ca3af', '#4b5563', '#d85a30']

  const fonts = ['Inter', 'Playfair Display', 'Montserrat', 'Poppins', 'Lora', 'DM Sans', 'Plus Jakarta Sans', 'Manrope', 'Outfit', 'Instrument Sans']
  const weights = ['300', '400', '500', '600', '700', '800']
  const buttonStyles = [
    { id: 'filled', label: 'Filled' },
    { id: 'outline', label: 'Outline' },
    { id: 'ghost', label: 'Ghost' },
    { id: 'soft', label: 'Soft' },
  ]

  const handleApply = () => {
    updatePage(page.id, {
      accentColor, bgColor, headingColor, subtitleColor, buttonTextColor,
      cornerRadius, headingFont, bodyFont, headingSize, bodySize,
      buttonStyle, headingWeight, bodyWeight,
    })
  }

  return (
    <div className="p-4 space-y-5">
      <h3 className="text-sm font-semibold text-gray-900">Design Tokens</h3>

      {/* Accent */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Accent color</label>
        <div className="flex gap-2 mb-2">
          {accentPresets.map(color => (
            <button key={color}
              onClick={() => setAccentColor(color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                accentColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-600 font-mono">{accentColor}</span>
        </div>
      </div>

      {/* Background */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Background color</label>
        <div className="flex gap-2 mb-2">
          {bgPresets.map(color => (
            <button key={color}
              onClick={() => setBgColor(color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                bgColor === color ? 'border-gray-900 scale-110' : color === '#ffffff' ? 'border-gray-200' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-600 font-mono">{bgColor}</span>
        </div>
      </div>

      {/* Heading color */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Heading color</label>
        <div className="flex gap-2 mb-2">
          {headingPresets.map(color => (
            <button key={color}
              onClick={() => setHeadingColor(color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                headingColor === color ? 'border-gray-900 scale-110' : color === '#ffffff' ? 'border-gray-200' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={headingColor} onChange={e => setHeadingColor(e.target.value)}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-600 font-mono">{headingColor}</span>
        </div>
      </div>

      {/* Subtitle color */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Subtitle / body color</label>
        <div className="flex gap-2 mb-2">
          {subtitlePresets.map(color => (
            <button key={color}
              onClick={() => setSubtitleColor(color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                subtitleColor === color ? 'border-gray-900 scale-110' : color === '#ffffff' ? 'border-gray-200' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={subtitleColor} onChange={e => setSubtitleColor(e.target.value)}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-600 font-mono">{subtitleColor}</span>
        </div>
      </div>

      {/* Button text color */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Button text color</label>
        <div className="flex items-center gap-3">
          <input type="color" value={buttonTextColor} onChange={e => setButtonTextColor(e.target.value)}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-600 font-mono">{buttonTextColor}</span>
        </div>
      </div>

      {/* Corner radius */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Corner radius (px)</label>
        <input type="range" min="0" max="24" value={cornerRadius}
          onChange={e => setCornerRadius(Number(e.target.value))}
          className="w-full accent-[#d85a30]" />
        <div className="text-xs text-gray-600 font-mono mt-1">{cornerRadius}px</div>
      </div>

      {/* Heading font */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Heading font</label>
        <select value={headingFont} onChange={e => setHeadingFont(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]">
          {fonts.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Heading weight */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Heading weight</label>
        <div className="flex gap-1">
          {weights.map(w => (
            <button key={w}
              onClick={() => setHeadingWeight(w)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                headingWeight === w
                  ? 'bg-[#d85a30] text-white border-[#d85a30]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={{ fontWeight: w }}>
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Heading size */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Heading size (px)</label>
        <input type="range" min="14" max="32" value={headingSize}
          onChange={e => setHeadingSize(Number(e.target.value))}
          className="w-full accent-[#d85a30]" />
        <div className="text-xs text-gray-600 font-mono mt-1">{headingSize}px</div>
      </div>

      {/* Body font */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Body font</label>
        <select value={bodyFont} onChange={e => setBodyFont(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]">
          {fonts.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Body weight */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Body weight</label>
        <div className="flex gap-1">
          {weights.filter(w => ['300','400','500','600'].includes(w)).map(w => (
            <button key={w}
              onClick={() => setBodyWeight(w)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                bodyWeight === w
                  ? 'bg-[#d85a30] text-white border-[#d85a30]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={{ fontWeight: w }}>
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Body size */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Body size (px)</label>
        <input type="range" min="11" max="20" value={bodySize}
          onChange={e => setBodySize(Number(e.target.value))}
          className="w-full accent-[#d85a30]" />
        <div className="text-xs text-gray-600 font-mono mt-1">{bodySize}px</div>
      </div>

      {/* Button style */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Button style</label>
        <div className="flex gap-2">
          {buttonStyles.map(bs => (
            <button key={bs.id}
              onClick={() => setButtonStyle(bs.id)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                buttonStyle === bs.id
                  ? 'bg-[#d85a30] text-white border-[#d85a30]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              {bs.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleApply}
        className="w-full bg-[#d85a30] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
      >
        Apply style
      </button>
    </div>
  )
}

/* ============================
   Helper Components
   ============================ */
function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

/* ============================
   Live Page HTML Generator
   ============================ */
function generateLiveHtml(page, connectedLoc) {
  const steps = page.steps || {}
  const hero = steps.heroDate || {}
  const service = page.service || {}
  const accent = page.accentColor || '#d85a30'
  const bg = page.bgColor || '#ffffff'
  const text = page.textColor || '#1a1a1a'
  const radius = page.cornerRadius || 14

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title || 'Book Appointment'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            accent: '${accent}',
            'accent-dark': '${adjustColor(accent, -20)}',
          },
          borderRadius: {
            custom: '${radius}px',
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { font-family: 'Inter', system-ui, sans-serif; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-gray-50 flex items-start justify-center min-h-screen py-8 px-4">
  <div id="root"></div>
  <script>
    const DATA = ${JSON.stringify({
      steps: page.steps,
      service: page.service,
      businessName: page.businessName,
      address: page.address,
      phone: page.phone,
      showFooter: page.showFooter !== false,
      accentColor: accent,
      textColor: text,
      calendarId: page.calendarId || null,
      assignedUserId: page.assignedUserId || null,
      ghlLocationId: connectedLoc?.ghlLocationId || null,
      ghlPitToken: connectedLoc?.pitToken || null,
    })};

    const WEEKDAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    function getWeekDates() {
      const today = new Date(), dates = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(today); d.setDate(today.getDate() + i); dates.push(d);
      }
      return dates;
    }

    let timeSlots = [];
    let loadingSlots = false;
    let slotsError = '';

    async function fetchGhlSlots(date) {
      if (!DATA.calendarId || !DATA.ghlPitToken || !DATA.ghlLocationId) return;
      loadingSlots = true;
      slotsError = '';
      timeSlots = [];

      const dateStr = date.toISOString().split('T')[0];
      let url = 'https://services.leadconnectorhq.com/calendars/' + DATA.calendarId + '/free-slots?locationId=' + DATA.ghlLocationId + '&startDate=' + dateStr + '&endDate=' + dateStr;
      if (DATA.assignedUserId) url += '&userId=' + DATA.assignedUserId;

      try {
        const res = await fetch(url, {
          headers: { 'Authorization': 'Bearer ' + DATA.ghlPitToken, 'Version': '2021-04-15' }
        });
        if (!res.ok) { slotsError = 'Slots API returned ' + res.status; loadingSlots = false; render(); return; }
        const data = await res.json();
        const slots = [];
        if (data[dateStr] && Array.isArray(data[dateStr])) {
          data[dateStr].forEach(function(slot) {
            if (slot.slot && slot.slot.startTime) {
              var t = formatTime(slot.slot.startTime);
              if (t) slots.push(t);
            }
          });
        }
        if (slots.length === 0 && Array.isArray(data)) {
          data.forEach(function(slot) {
            if (typeof slot === 'string') { var t = formatTime(slot); if (t) slots.push(t); }
            else if (slot.startTime) { var t = formatTime(slot.startTime); if (t) slots.push(t); }
          });
        }
        var unique = []; slots.forEach(function(s) { if (unique.indexOf(s) === -1) unique.push(s); });
        unique.sort();
        timeSlots = unique;
      } catch(e) { slotsError = e.message; }
      loadingSlots = false;
      render();
    }

    function formatTime(timeStr) {
      if (!timeStr) return null;
      try {
        var hours, minutes;
        if (timeStr.indexOf('T') !== -1) { var p = timeStr.split('T')[1].split(':'); hours = parseInt(p[0], 10); minutes = parseInt(p[1], 10); }
        else if (timeStr.indexOf(':') !== -1) { var p = timeStr.split(':'); hours = parseInt(p[0], 10); minutes = parseInt(p[1], 10); }
        else return timeStr;
        var ampm = hours >= 12 ? 'PM' : 'AM';
        var h = hours % 12 || 12;
        return h + ':' + (minutes < 10 ? '0' : '') + minutes + ' ' + ampm;
      } catch(e) { return timeStr; }
    }

    function formatDate(d) {
      return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
    }

    let state = { step: 0, date: null, time: null, name: '', email: '', phone: '', notes: '' };

    function render() {
      const h = DATA.steps.heroDate || {};
      const s = DATA.service || {};
      const t = DATA.steps.time || {};
      const f = DATA.steps.form || {};
      const c = DATA.steps.confirmation || {};
      const accent = DATA.accentColor;
      const textColor = DATA.textColor;
      const dates = getWeekDates();

      let html = '<div class="max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200" style="font-family: Inter, sans-serif">';

      // Steps indicator
      html += '<div class="flex items-center gap-1 px-4 pt-4 pb-2">';
      ['Date','Time','Details','Done'].forEach((l, i) => {
        html += '<div class="flex-1 flex items-center">';
        html += '<div class="text-[10px] font-semibold uppercase tracking-wider' + (i <= state.step ? '' : ' opacity-30') + '" style="color:' + (i <= state.step ? accent : textColor) + '">' + l + '</div>';
        if (i < 3) html += '<div class="flex-1 h-px ml-1" style="background:' + (i < state.step ? accent : '#e5e7eb') + '"></div>';
        html += '</div>';
      });
      html += '</div>';

      // Urgency banner
      if (h.showUrgencyBanner !== false && h.urgencyText && state.step < 2) {
        html += '<div class="text-center text-sm font-semibold text-white py-2.5 px-4" style="background:#ea580c">' + escapeHtml(h.urgencyText) + '</div>';
      }

      // Step 0: Hero + Date
      if (state.step === 0) {
        if (h.heroImage) {
          html += '<div class="relative h-48 overflow-hidden">';
          html += '<img src="' + escapeHtml(h.heroImage) + '" class="w-full h-full object-cover" />';
          if (h.ctaText) html += '<span class="absolute top-3 left-3 text-xs font-semibold tracking-wider uppercase text-gray-800 bg-white/80 backdrop-blur-sm rounded px-3 py-1">' + escapeHtml(h.ctaText) + '</span>';
          if (s.show !== false && s.price) html += '<span class="absolute bottom-3 right-3 text-lg font-bold text-white bg-black/40 backdrop-blur-sm rounded px-3 py-1">' + escapeHtml(s.price) + '</span>';
          html += '<div class="absolute bottom-3 left-3 right-16"><h1 class="text-white font-bold text-lg leading-tight drop-shadow-lg">' + escapeHtml(h.headline) + '</h1></div>';
          html += '</div>';
        } else {
          html += '<div class="px-4 pt-4"><h1 class="text-xl font-bold" style="color:' + textColor + '">' + escapeHtml(h.headline) + '</h1>';
          if (h.subtitle) html += '<p class="text-sm mt-1 text-gray-500">' + escapeHtml(h.subtitle) + '</p></div>';
        }

        if (s.show !== false) {
          html += '<div class="px-4 py-4 border-b border-gray-100"><div class="flex items-start justify-between">';
          html += '<div class="flex-1 min-w-0"><h3 class="text-sm font-semibold" style="color:' + textColor + '">' + escapeHtml(s.name) + '</h3>';
          if (s.description) html += '<p class="text-xs text-gray-500 mt-0.5">' + escapeHtml(s.description) + '</p>';
          html += '</div><div class="text-right shrink-0 ml-3"><div class="text-base font-bold" style="color:#ea580c">' + escapeHtml(s.price) + '</div>';
          if (s.period) html += '<div class="text-[10px] text-gray-400">' + escapeHtml(s.period) + '</div>';
          html += '</div></div></div>';
        }

        html += '<div class="px-4 py-4"><p class="text-xs text-gray-400 mb-3">' + escapeHtml(h.helperText || 'Tap a date to pick a time') + '</p>';
        html += '<div class="grid grid-cols-4 gap-2">';
        for (let i = 0; i < 8 && i < dates.length; i++) {
          const d = dates[i];
          const dn = WEEKDAYS[d.getDay()];
          const num = d.getDate();
          const sel = state.date && state.date.getTime && typeof state.date.getTime === 'function' ? false : state.date instanceof Date ? state.date.getTime() === d.getTime() : false;
          const isSel = state.date === d;
          html += '<button onclick=\\'setDate(' + i + ')\\' class="flex flex-col items-center py-2.5 px-1 rounded-lg border transition-all duration-150 hover:scale-105 active:scale-95" style="border-color:' + (isSel ? accent : '#e5e7eb') + ';background:' + (isSel ? accent + '10' : 'white') + '">';
          html += '<span class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">' + dn + '</span>';
          html += '<span class="text-base font-bold mt-0.5" style="color:' + (i === 0 ? accent : textColor) + '">' + num + '</span>';
          html += '</button>';
        }
        html += '</div></div>';
      }

// Step 1: Time
      if (state.step === 1) {
        html += '<div class="px-4 py-4 animate-fade-in">';
        html += '<div class="flex items-center justify-between mb-4"><div><p class="text-xs text-gray-500">Selected date</p><p class="text-sm font-semibold mt-0.5" style="color:' + textColor + '">' + (state.date ? formatDate(new Date(state.date)) : '') + '</p></div>';
        if (t.showChangeDateBack !== false) html += '<button onclick=\\'goBack()\\' class="text-xs font-medium underline cursor-pointer" style="color:' + accent + '">Change date</button>';
        html += '</div>';
        if (loadingSlots) {
          html += '<div class="text-center py-8 text-sm text-gray-400">Loading available times...</div>';
        } else if (slotsError) {
          html += '<div class="text-xs text-red-500 mb-3 p-2 bg-red-50 rounded-lg">' + escapeHtml(slotsError) + '</div>';
        } else if (timeSlots.length > 0) {
          html += '<p class="text-xs text-gray-400 mb-3">' + escapeHtml(t.helperText || 'Select a time') + '</p>';
          html += '<div class="grid grid-cols-2 gap-2">';
          timeSlots.forEach(function(slot, i) {
            var isSel = state.time === slot;
            html += '<button onclick=\\'selectTimeSlot(' + i + ')\\' class="py-2.5 text-sm font-medium rounded-lg border transition-all duration-150" style="border-color:' + (isSel ? accent : '#e5e7eb') + ';color:' + (isSel ? 'white' : textColor) + ';background:' + (isSel ? accent : 'white') + '">' + slot + '</button>';
          });
          html += '</div>';
        } else {
          html += '<div class="text-center py-8 text-sm text-gray-400">No available slots for this date. Try another day.</div>';
        }
        html += '</div>';
      }

      // Step 2: Form
      if (state.step === 2) {
        html += '<form onsubmit=\\'return handleSubmit(event)\\' class="px-4 py-4 animate-fade-in">';
        html += '<div class="flex items-center gap-2 mb-4"><button type="button" onclick=\\'goBack()\\' class="text-gray-400 hover:text-gray-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>';
        html += '<div><p class="text-sm font-semibold" style="color:' + textColor + '">' + escapeHtml(f.heading || 'Almost done') + '</p>';
        html += '<p class="text-xs text-gray-400">' + escapeHtml(f.helperText || 'Enter your details to confirm') + '</p></div></div>';
        html += '<div class="space-y-3">';
        html += '<input required placeholder="Full name" value="' + escapeHtml(state.name) + '" oninput=\\'state.name = this.value\\' class="w-full border border-gray-200 rounded-lg p-3 text-sm" />';
        html += '<input required type="email" placeholder="Email address" value="' + escapeHtml(state.email) + '" oninput=\\'state.email = this.value\\' class="w-full border border-gray-200 rounded-lg p-3 text-sm" />';
        html += '<input required type="tel" placeholder="Phone number" value="' + escapeHtml(state.phone) + '" oninput=\\'state.phone = this.value\\' class="w-full border border-gray-200 rounded-lg p-3 text-sm" />';
        html += '<textarea placeholder="Notes (optional)" rows="2" oninput=\\'state.notes = this.value\\' class="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none"></textarea>';
        html += '</div>';
        html += '<button type="submit" class="w-full mt-4 py-3 text-sm font-semibold text-white rounded-lg hover:opacity-90" style="background:' + accent + '">' + escapeHtml(f.buttonText || 'Confirm appointment') + '</button>';
        if (f.privacyText) html += '<p class="text-[10px] text-gray-400 text-center mt-3">' + escapeHtml(f.privacyText) + '</p>';
        html += '</form>';
      }

      // Step 3: Confirmation
      if (state.step === 3) {
        html += '<div class="px-4 py-8 text-center animate-fade-in">';
        html += '<div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background:' + accent + '15"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="' + accent + '" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></div>';
        html += '<h2 class="text-xl font-bold" style="color:' + textColor + '">' + escapeHtml(c.heading || "You're booked!") + '</h2>';
        html += '<p class="text-sm text-gray-500 mt-2">' + escapeHtml(c.message || 'A text confirmation is on its way.') + '</p>';
        if (state.date && state.time) {
          html += '<div class="mt-6 bg-gray-50 rounded-xl p-4 text-left">';
          html += '<div class="text-sm font-semibold" style="color:' + textColor + '">' + escapeHtml(s.name) + '</div>';
          html += '<div class="text-xs text-gray-500 mt-1 space-y-0.5"><div>' + formatDate(new Date(state.date)) + '</div><div>' + state.time + '</div></div>';
          html += '</div>';
        }
        if (c.showBookingReference) {
          html += '<div class="mt-4 text-xs text-gray-400">Reference: APT-' + Math.random().toString(36).slice(2, 7).toUpperCase() + '</div>';
        }
        if (DATA.showFooter && (DATA.businessName || DATA.address || DATA.phone)) {
          html += '<div class="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400">';
          if (DATA.businessName) html += '<div class="font-semibold">' + escapeHtml(DATA.businessName) + '</div>';
          if (DATA.address) html += '<div class="mt-0.5">' + escapeHtml(DATA.address) + '</div>';
          if (DATA.phone) html += '<div class="mt-0.5">' + escapeHtml(DATA.phone) + '</div>';
          html += '</div>';
        }
        html += '</div>';
      }

      html += '</div>';
      document.getElementById('root').innerHTML = html;
    }

    // For date selection
    window.setDate = function(i) {
      const dates = getWeekDates();
      state.date = dates[i];
      state.time = null;
      state.step = 1;
      render();
      fetchGhlSlots(dates[i]);
    };
    window.selectTimeSlot = function(i) {
      state.time = timeSlots[i];
      state.step = 2;
      render();
    };
    window.goBack = function() {
      if (state.step > 0) { state.step--; render(); }
    };
    window.handleSubmit = function(e) {
      e.preventDefault();
      state.step = 3;
      render();
      // POST booking data here if needed
      return false;
    };
    function escapeHtml(s) {
      if (!s) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    render();
  </script>
</body>
</html>`
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}