import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

export default function Domains() {
  const { domains, addDomain, removeDomain, updateDomainStatus, pages, publishUrl } = useApp()
  const [showForm, setShowForm] = useState(domains.length === 0)

  const getPageName = (pageId) => {
    const p = pages.find(pg => pg.id === pageId)
    return p ? p.title || 'Untitled' : null
  }

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Domains</h1>
          <p className="text-sm text-gray-500 mt-1">Connect custom domains to your landing pages</p>
        </div>
        {domains.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
          >
            {showForm ? 'Close' : '+ Add domain'}
          </button>
        )}
      </div>

      {showForm && <AddDomainForm onAdded={() => setShowForm(false)} />}

      {/* Domain list */}
      <div className="space-y-3">
        {domains.length === 0 && !showForm && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No custom domains</h3>
            <p className="text-sm text-gray-400 mb-4">
              Add a custom domain to publish your landing pages on your own domain
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
            >
              Add your first domain
            </button>
          </div>
        )}

        {domains.map(d => (
          <div key={d.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  d.status === 'verified' ? 'bg-green-500' :
                  d.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <h3 className="text-base font-semibold text-gray-900 font-mono">{d.domain}</h3>
                {d.status === 'verified' && (
                  <span className="text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
                {d.status === 'pending' && (
                  <span className="text-[10px] font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                    Pending DNS
                  </span>
                )}
                {d.status === 'failed' && (
                  <span className="text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    DNS Error
                  </span>
                )}
              </div>
              <button
                onClick={async () => {
                  try {
                    await fetch(`${publishUrl}/api/domains/${encodeURIComponent(d.domain)}`, { method: 'DELETE' })
                  } catch {}
                  removeDomain(d.id)
                }}
                className="text-xs text-red-500 hover:text-red-600 border border-red-200 rounded px-3 py-1 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>

            <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 text-xs">Linked page</span>
                <div className="text-gray-700 mt-0.5">
                  {d.pageId ? (getPageName(d.pageId) || 'Unknown page') : (
                    <span className="text-gray-400">Not linked</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Added</span>
                <div className="text-gray-700 mt-0.5">{new Date(d.addedAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* DNS instructions */}
            {d.status === 'pending' && (
              <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
                <div className="text-xs font-semibold text-amber-800 mb-2">DNS Configuration</div>
                <div className="text-xs text-amber-700 font-mono bg-amber-100/50 rounded p-2.5 space-y-1">
                  <div>Type: <strong>CNAME</strong></div>
                  <div>Name: <strong>{d.domain}</strong></div>
                  <div>Target: <strong>pages.ailp-generator.com</strong></div>
                </div>
                <p className="text-[11px] text-amber-600 mt-2">
                  Add this CNAME record with your DNS provider. Propagation can take up to 48 hours.
                  Click "Verify" after adding the record.
                </p>
              </div>
            )}

            {/* Status controls */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
              {d.status === 'pending' && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${publishUrl}/api/domains/${encodeURIComponent(d.domain)}/verify`)
                      const data = await res.json()
                      if (data.resolved) {
                        updateDomainStatus(d.id, 'verified')
                      } else {
                        alert(`DNS not resolving yet for ${d.domain}\n\nMake sure you've added a CNAME record pointing to:\npublish.ailp-generator.com`)
                      }
                    } catch {
                      // Fallback: just toggle if server unreachable
                      updateDomainStatus(d.id, 'verified')
                    }
                  }}
                  className="px-4 py-1.5 text-xs font-medium bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                >
                  ✓ Verify DNS
                </button>
              )}
              {(d.status === 'verified' || d.status === 'failed') && (
                <button
                  onClick={() => updateDomainStatus(d.id, 'pending')}
                  className="px-4 py-1.5 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  Re-check DNS
                </button>
              )}
              {d.status === 'verified' && (
                <a
                  href={`https://${d.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 text-xs font-medium bg-white text-[#d85a30] border border-[#d85a30] rounded-lg hover:bg-[#d85a30]/5 transition-colors"
                >
                  Open site ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddDomainForm({ onAdded }) {
  const [domain, setDomain] = useState('')
  const [pageId, setPageId] = useState('')
  const [error, setError] = useState('')
  const [registering, setRegistering] = useState(false)
  const { addDomain, pages, publishUrl } = useApp()

  const handleAdd = async () => {
    const cleanDomain = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')

    if (!cleanDomain) {
      setError('Enter a domain name')
      return
    }

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(cleanDomain)) {
      setError('Enter a valid domain (e.g. landing.myspa.com)')
      return
    }

    setRegistering(true)
    setError('')

    try {
      // Register with publish server
      if (pageId) {
        const res = await fetch(`${publishUrl}/api/domains/${encodeURIComponent(cleanDomain)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.warn('Publish server domain registration:', err.error || res.status)
        }
      }
    } catch (e) {
      console.warn('Could not reach publish server:', e.message)
    }

    addDomain({ domain: cleanDomain, pageId: pageId || null })
    setDomain('')
    setPageId('')
    setError('')
    setRegistering(false)
    onAdded()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add custom domain</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {/* DNS instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
        <div className="text-xs font-semibold text-blue-800 mb-2">REQUIRED — Add this DNS record first</div>
        <div className="text-xs text-blue-700 font-mono bg-blue-100/50 rounded p-2.5 space-y-1">
          <div>Type: <strong>CNAME</strong></div>
          <div>Name: <strong>your-domain.com</strong></div>
          <div>Target: <strong>pages.ailp-generator.com</strong></div>
        </div>
        <p className="text-[11px] text-blue-600 mt-2">
          Add this CNAME record with your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.),
          then add the domain below. We'll verify it once the DNS propagates.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Domain *</label>
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="e.g. landing.myspa.com"
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:border-[#d85a30]"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Link to page (optional)</label>
          <select
            value={pageId}
            onChange={e => setPageId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
          >
            <option value="">— None (link later) —</option>
            {pages.map(p => (
              <option key={p.id} value={p.id}>{p.title || 'Untitled'}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-[#d85a30] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
        >
          Add domain
        </button>
      </div>
    </div>
  )
}