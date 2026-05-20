import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

export default function Locations() {
  const { locations, addLocation, removeLocation, updateLocationStatus } = useApp()
  const [showForm, setShowForm] = useState(locations.length === 0)

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Locations</h1>
          <p className="text-sm text-gray-500 mt-1">Connect and manage GoHighLevel sub-accounts</p>
        </div>
        {locations.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
          >
            {showForm ? 'Close' : '+ Connect GHL sub-account'}
          </button>
        )}
      </div>

      {/* Connect form */}
      {showForm && <ConnectForm onConnected={() => setShowForm(false)} />}

      {/* Connected locations list */}
      <div className="space-y-4">
        {locations.length === 0 && !showForm && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No locations connected</h3>
            <p className="text-sm text-gray-400 mb-4">Connect your first GoHighLevel sub-account to start capturing leads</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
            >
              Connect a GHL sub-account
            </button>
          </div>
        )}

        {locations.map(loc => (
          <div key={loc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  loc.status === 'active' ? 'bg-green-500' :
                  loc.status === 'paused' ? 'bg-yellow-400' : 'bg-gray-300'
                }`} />
                <h3 className="text-base font-semibold text-gray-900">{loc.displayName}</h3>
                <span className="text-xs text-gray-400">({loc.ghlLocationId})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeLocation(loc.id)}
                  className="text-xs text-red-500 hover:text-red-600 border border-red-200 rounded px-3 py-1 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 text-xs">Display name</span>
                <div className="text-gray-700">{loc.displayName}</div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">GHL Location ID</span>
                <div className="text-gray-700 font-mono text-xs">{loc.ghlLocationId}</div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Timezone</span>
                <div className="text-gray-700">{loc.timezone}</div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Country</span>
                <div className="text-gray-700">{loc.country}</div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Connected</span>
                <div className="text-gray-700">{new Date(loc.connectedAt).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Status</span>
                <div className={`font-medium capitalize ${
                  loc.status === 'active' ? 'text-green-600' :
                  loc.status === 'paused' ? 'text-yellow-600' : 'text-gray-400'
                }`}>{loc.status}</div>
              </div>
            </div>

            {/* Status controls */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
              <button
                onClick={() => updateLocationStatus(loc.id, 'active')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  loc.status === 'active'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => updateLocationStatus(loc.id, 'paused')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  loc.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300'
                }`}
              >
                Paused
              </button>
              <button
                onClick={() => updateLocationStatus(loc.id, 'off')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  loc.status === 'off'
                    ? 'bg-gray-100 text-gray-500 border border-gray-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-500'
                }`}
              >
                Off
              </button>
              <div className="w-px h-5 bg-gray-200 mx-2" />
              <button className="px-4 py-1.5 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Re-sync resources
              </button>
              <button className="px-4 py-1.5 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Rotate PIT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConnectForm({ onConnected }) {
  const [displayName, setDisplayName] = useState('')
  const [ghlLocationId, setGhlLocationId] = useState('')
  const [pitToken, setPitToken] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [country, setCountry] = useState('US — United States')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { addLocation } = useApp()

  const handleVerify = async () => {
    if (!displayName || !ghlLocationId || !pitToken) {
      setError('Please fill in all required fields')
      return
    }

    setVerifying(true)
    setError('')
    setSuccess('')

    // Verify the PIT token by making a lightweight API call to GHL
    try {
      const res = await fetch(`https://rest.gohighlevel.com/v1/locations/${ghlLocationId}`, {
        headers: {
          'Authorization': `Bearer ${pitToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `GHL API returned ${res.status} — check your Location ID and PIT`)
      }

      const data = await res.json()

      addLocation({
        displayName,
        ghlLocationId,
        pitToken,
        timezone,
        country,
      })

      setSuccess(`Connected ✓ "${data.location?.name || displayName}" is now linked`)

      // Reset form
      setDisplayName('')
      setGhlLocationId('')
      setPitToken('')

      setTimeout(() => {
        onConnected()
      }, 1500)

    } catch (err) {
      // If the API call fails, still allow connecting for offline/local use
      // but show the error
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        addLocation({ displayName, ghlLocationId, pitToken, timezone, country })
        setSuccess(`Location added (offline mode — couldn't verify PIT token, verify later in GHL)`)
        setTimeout(() => onConnected(), 1500)
      } else {
        setError(err.message)
      }
    } finally {
      setVerifying(false)
    }
  }

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver',
    'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu',
  ]

  const countries = [
    'US — United States', 'CA — Canada', 'GB — United Kingdom',
    'AU — Australia', 'DE — Germany', 'FR — France',
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect a GHL sub-account</h2>

      {/* Pre-connect instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
        <div className="text-xs font-semibold text-amber-800 mb-2">BEFORE YOU START — DO THESE IN GHL FIRST</div>
        <ul className="text-xs text-amber-700 space-y-1.5 list-disc pl-4">
          <li>Go to <strong>Settings → Business Profile</strong> and copy the Location ID</li>
          <li>Go to <strong>Settings → Integrations → Private Integrations</strong> and create a PIT with scopes: <code className="bg-amber-100 px-1 rounded">locations.readonly</code>, <code className="bg-amber-100 px-1 rounded">calendars.readonly</code>, <code className="bg-amber-100 px-1 rounded">calendars/events.write</code>, <code className="bg-amber-100 px-1 rounded">contacts.write</code></li>
          <li>SMS/Email workflow set up (recommended) — trigger: Appointment Created</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Display name *</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="e.g. Bella Beauty Spa LA"
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">GHL Location ID *</label>
          <input
            value={ghlLocationId}
            onChange={e => setGhlLocationId(e.target.value)}
            placeholder="e.g. 2B5Mlzpu4RtnF8GhJ0aP"
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:border-[#d85a30]"
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-500 mb-1 block">Private Integration Token (V2) *</label>
          <input
            type="password"
            value={pitToken}
            onChange={e => setPitToken(e.target.value)}
            placeholder="pit-..."
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:border-[#d85a30]"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Timezone</label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Country</label>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
          >
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleVerify}
        disabled={verifying}
        className="w-full bg-[#d85a30] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {verifying ? 'Verifying & connecting...' : 'Verify & connect'}
      </button>
    </div>
  )
}