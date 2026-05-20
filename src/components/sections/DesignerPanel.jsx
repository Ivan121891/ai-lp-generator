import { useState } from 'react'
import { SECTION_TYPES, getDefaultSectionsForPage, generateCSS } from '../../data/sections'

export default function DesignerPanel({ page, updatePage, settings }) {
  const sections = page.sections || getDefaultSectionsForPage()
  const [selectedSection, setSelectedSection] = useState(sections[0]?.id || null)
  const css = generateCSS({ ...settings, ...page })

  const updateSection = (id, updates) => {
    const updated = sections.map(s =>
      s.id === id ? { ...s, content: { ...s.content, ...updates } } : s
    )
    updatePage(page.id, { sections: updated })
  }

  const updateNested = (id, key, array, idx, field, value) => {
    const updated = sections.map(s => {
      if (s.id !== id) return s
      const newItems = [...(s.content[key] || [])]
      newItems[idx] = { ...newItems[idx], [field]: value }
      return { ...s, content: { ...s.content, [key]: newItems } }
    })
    updatePage(page.id, { sections: updated })
  }

  const toggleVisibility = (id) => {
    const updated = sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    )
    updatePage(page.id, { sections: updated })
  }

  const addSection = (type) => {
    const defaults = getDefaultSectionsForPage()
    const newS = defaults.find(d => d.type === type)
    if (!newS) return
    newS.id = `${type}-${Date.now()}`
    const updated = [...sections, newS]
    updatePage(page.id, { sections: updated })
    setSelectedSection(newS.id)
  }

  const removeSection = (id) => {
    if (sections.length <= 1) return
    const updated = sections.filter(s => s.id !== id)
    updatePage(page.id, { sections: updated })
    setSelectedSection(updated[0]?.id || null)
  }

  const moveSection = (id, direction) => {
    const idx = sections.findIndex(s => s.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === sections.length - 1) return
    const updated = [...sections]
    const swap = direction === 'up' ? idx - 1 : idx + 1
    ;[updated[idx], updated[swap]] = [updated[swap], updated[idx]]
    updatePage(page.id, { sections: updated })
  }

  const selected = sections.find(s => s.id === selectedSection)

  const panels = ['sections', 'editor']
  const [activePanel, setActivePanel] = useState('editor')

  return (
    <div className="flex flex-col h-full">
      {/* Panel tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        <button
          onClick={() => setActivePanel('editor')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activePanel === 'editor'
              ? 'text-[#d85a30] border-b-2 border-[#d85a30]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActivePanel('sections')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activePanel === 'sections'
              ? 'text-[#d85a30] border-b-2 border-[#d85a30]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sections ({sections.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activePanel === 'sections' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Section Manager</h3>
            <p className="text-[11px] text-gray-400">Add, reorder, or toggle sections</p>

            {/* Section list */}
            <div className="space-y-1">
              {sections.map((s, i) => {
                const typeInfo = SECTION_TYPES.find(t => t.id === s.type)
                return (
                  <div key={s.id}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      selectedSection === s.id ? 'bg-[#d85a30]/10 ring-1 ring-[#d85a30]/30' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedSection(s.id)}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(s.id) }}
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] cursor-pointer ${
                        s.visible !== false ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {s.visible !== false ? '✓' : '—'}
                    </button>
                    <span className="w-5 text-center">{typeInfo?.icon || '•'}</span>
                    <span className="flex-1 truncate font-medium">{typeInfo?.label || s.type}</span>
                    <div className="flex gap-0.5">
                      {i > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 'up') }}
                          className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">↑</button>
                      )}
                      {i < sections.length - 1 && (
                        <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 'down') }}
                          className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">↓</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add section */}
            <div className="pt-3 border-t border-gray-100">
              <label className="text-[11px] text-gray-500 mb-2 block">Add section</label>
              <div className="grid grid-cols-2 gap-1.5">
                {SECTION_TYPES.map(st => {
                  const has = sections.some(s => s.type === st.id)
                  return (
                    <button
                      key={st.id}
                      onClick={() => addSection(st.id)}
                      disabled={has && ['hero', 'footer'].includes(st.id)}
                      className="flex items-center gap-1.5 px-2.5 py-2 text-[11px] rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        borderColor: `${css.accent}30`,
                        color: css.accent,
                      }}
                    >
                      <span>{st.icon}</span>
                      <span>{st.label}</span>
                      {has && <span className="text-gray-300 ml-auto">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Delete section */}
            {selected && selected.type !== 'hero' && selected.type !== 'footer' && (
              <button
                onClick={() => removeSection(selected.id)}
                className="w-full mt-3 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Remove "{SECTION_TYPES.find(t => t.id === selected.type)?.label}" section
              </button>
            )}
          </div>
        )}

        {activePanel === 'editor' && selected && (
          <SectionEditor
            section={selected}
            css={css}
            onUpdate={(updates) => updateSection(selected.id, updates)}
            onNestedUpdate={(key, idx, field, value) => updateNested(selected.id, key, selected.content[key], idx, field, value)}
            onAddItem={(key, defaults) => {
              const items = [...(selected.content[key] || []), defaults]
              updateSection(selected.id, { [key]: items })
            }}
            onRemoveItem={(key, idx) => {
              const items = selected.content[key].filter((_, i) => i !== idx)
              updateSection(selected.id, { [key]: items })
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ====== Section Editor ====== */
function SectionEditor({ section, css, onUpdate, onNestedUpdate, onAddItem, onRemoveItem }) {
  const { type, content } = section

  const Field = ({ label, value, onChange, multiline, mono, type: inputType }) => (
    <div className="mb-3">
      <label className="text-[11px] text-gray-500 mb-1 block">{label}</label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2 text-xs resize-none focus:outline-none focus:border-[#d85a30]"
          rows={2}
        />
      ) : (
        <input
          type={inputType || 'text'}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className={`w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#d85a30] ${mono ? 'font-mono' : ''}`}
        />
      )}
    </div>
  )

  const ItemsEditor = ({ items, fields, itemLabel, keyName }) => (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-gray-600">{itemLabel || 'Items'}</label>
        <button
          onClick={() => {
            const defaults = {}
            fields.forEach(f => { defaults[f.key] = '' })
            onAddItem(keyName, defaults)
          }}
          className="text-[11px] text-[#d85a30] hover:underline cursor-pointer"
        >
          + Add
        </button>
      </div>
      {(items || []).map((item, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-gray-500">{itemLabel} {idx + 1}</span>
            <button
              onClick={() => onRemoveItem(keyName, idx)}
              className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer"
            >
              Remove
            </button>
          </div>
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-[10px] text-gray-400 mb-0.5 block">{f.label}</label>
              {f.multiline ? (
                <textarea
                  value={item[f.key] || ''}
                  onChange={e => onNestedUpdate(keyName, idx, f.key, e.target.value)}
                  className="w-full border border-gray-200 rounded p-1.5 text-[11px] resize-none focus:outline-none focus:border-[#d85a30]"
                  rows={2}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={item[f.key] || ''}
                  onChange={e => onNestedUpdate(keyName, idx, f.key, e.target.value)}
                  className="w-full border border-gray-200 rounded p-1.5 text-[11px] focus:outline-none focus:border-[#d85a30]"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  const Toggle = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between mb-3">
      <label className="text-[11px] text-gray-500">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
          value ? 'bg-[#d85a30]' : 'bg-gray-300'
        }`}
      >
        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
          value ? 'translate-x-[18px]' : 'translate-x-[2px]'
        }`} />
      </button>
    </div>
  )

  if (type === 'hero') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">Hero Section</h3>
        <Field label="Headline" value={content.headline} onChange={v => onUpdate({ headline: v })} />
        <Field label="Subtext" value={content.subtext} onChange={v => onUpdate({ subtext: v })} multiline />
        <Field label="Primary CTA" value={content.primaryCta} onChange={v => onUpdate({ primaryCta: v })} />
        <Field label="Secondary CTA" value={content.secondaryCta} onChange={v => onUpdate({ secondaryCta: v })} />
        <Field label="Badge Text" value={content.badgeText} onChange={v => onUpdate({ badgeText: v })} />
        <Field label="Image URL" value={content.image} onChange={v => onUpdate({ image: v })} mono />
        <Field label="Trust Text" value={content.trustText} onChange={v => onUpdate({ trustText: v })} />
        <Toggle label="Show trust bar" value={content.showTrustBar} onChange={v => onUpdate({ showTrustBar: v })} />
        <Toggle label="Show badge" value={content.showBadge} onChange={v => onUpdate({ showBadge: v })} />
      </div>
    )
  }

  if (type === 'services') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">Services Section</h3>
        <Field label="Heading" value={content.heading} onChange={v => onUpdate({ heading: v })} />
        <Field label="Subtext" value={content.subtext} onChange={v => onUpdate({ subtext: v })} />
        <ItemsEditor
          items={content.items}
          keyName="items"
          itemLabel="Service"
          fields={[
            { key: 'title', label: 'Title' },
            { key: 'price', label: 'Price' },
            { key: 'description', label: 'Description' },
            { key: 'image', label: 'Image URL' },
            { key: 'bullets', label: 'Bullets (comma-separated)', multiline: true },
          ]}
        />
      </div>
    )
  }

  if (type === 'testimonials') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">Testimonials Section</h3>
        <Field label="Heading" value={content.heading} onChange={v => onUpdate({ heading: v })} />
        <ItemsEditor
          items={content.items}
          keyName="items"
          itemLabel="Review"
          fields={[
            { key: 'name', label: 'Name' },
            { key: 'quote', label: 'Quote', multiline: true },
            { key: 'service', label: 'Service' },
            { key: 'initials', label: 'Initials' },
            { key: 'rating', label: 'Rating (1-5)', type: 'number' },
          ]}
        />
      </div>
    )
  }

  if (type === 'stats') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">Stats Section</h3>
        <Field label="Heading" value={content.heading} onChange={v => onUpdate({ heading: v })} />
        <Field label="Subtext" value={content.subtext} onChange={v => onUpdate({ subtext: v })} />
        <ItemsEditor
          items={content.items}
          keyName="items"
          itemLabel="Stat"
          fields={[
            { key: 'value', label: 'Value (e.g. 500+)' },
            { key: 'label', label: 'Label' },
          ]}
        />
      </div>
    )
  }

  if (type === 'faq') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">FAQ Section</h3>
        <Field label="Heading" value={content.heading} onChange={v => onUpdate({ heading: v })} />
        <ItemsEditor
          items={content.items}
          keyName="items"
          itemLabel="Question"
          fields={[
            { key: 'question', label: 'Question' },
            { key: 'answer', label: 'Answer', multiline: true },
          ]}
        />
      </div>
    )
  }

  if (type === 'cta') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">CTA Banner Section</h3>
        <Field label="Headline" value={content.headline} onChange={v => onUpdate({ headline: v })} />
        <Field label="Subtext" value={content.subtext} onChange={v => onUpdate({ subtext: v })} />
        <Field label="Primary CTA" value={content.primaryCta} onChange={v => onUpdate({ primaryCta: v })} />
        <Field label="Secondary CTA" value={content.secondaryCta} onChange={v => onUpdate({ secondaryCta: v })} />
        <Field label="Phone" value={content.phone} onChange={v => onUpdate({ phone: v })} />
        <Field label="Background Image URL" value={content.bgImage} onChange={v => onUpdate({ bgImage: v })} mono />
      </div>
    )
  }

  if (type === 'footer') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">Footer Section</h3>
        <Field label="Brand Name" value={content.brand} onChange={v => onUpdate({ brand: v })} />
        <Field label="Tagline" value={content.tagline} onChange={v => onUpdate({ tagline: v })} />
        <Field label="Address" value={content.address} onChange={v => onUpdate({ address: v })} />
        <Field label="Phone" value={content.phone} onChange={v => onUpdate({ phone: v })} />
        <Field label="Email" value={content.email} onChange={v => onUpdate({ email: v })} />
        <Field label="Hours" value={content.hours} onChange={v => onUpdate({ hours: v })} />
        <ItemsEditor
          items={content.links}
          keyName="links"
          itemLabel="Link"
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'URL' },
          ]}
        />
      </div>
    )
  }

  return <p className="text-xs text-gray-400">Select a section to edit</p>
}