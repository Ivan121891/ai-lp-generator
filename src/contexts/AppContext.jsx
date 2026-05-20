import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext()

const STORAGE_KEYS = {
  pages: 'ailp-pages',
  apiKey: 'ailp-api-key',
  settings: 'ailp-settings',
  locations: 'ailp-locations',
  domains: 'ailp-domains',
}

export function AppProvider({ children }) {
  const [pages, setPages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.pages)
    return saved ? JSON.parse(saved) : []
  })

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.apiKey) || ''
  })

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.settings)
    return saved ? JSON.parse(saved) : {
      accentColor: '#d85a30',
      accentTextColor: '#ffffff',
      bgColor: '#ffffff',
      textColor: '#1a1a1a',
      cornerRadius: 14,
      headingFont: 'Inter',
      model: 'openai/gpt-4o-mini',
    }
  })

  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.locations)
    return saved ? JSON.parse(saved) : []
  })

  const [domains, setDomains] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.domains)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.pages, JSON.stringify(pages))
  }, [pages])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiKey, apiKey)
  }, [apiKey])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(locations))
  }, [locations])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.domains, JSON.stringify(domains))
  }, [domains])

  const addPage = useCallback((page) => {
    setPages(prev => [{ ...page, id: crypto.randomUUID(), createdAt: new Date().toISOString(), views: 0, bookings: 0 }, ...prev])
  }, [])

  const removePage = useCallback((id) => {
    setPages(prev => prev.filter(p => p.id !== id))
  }, [])

  const updatePage = useCallback((id, updates) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  // Location management
  const addLocation = useCallback((loc) => {
    setLocations(prev => [{ ...loc, id: crypto.randomUUID(), status: 'active', connectedAt: new Date().toISOString() }, ...prev])
  }, [])

  const removeLocation = useCallback((id) => {
    setLocations(prev => prev.filter(l => l.id !== id))
  }, [])

  const updateLocationStatus = useCallback((id, status) => {
    setLocations(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }, [])

  // Domain management
  const addDomain = useCallback((domain) => {
    setDomains(prev => [{ ...domain, id: crypto.randomUUID(), status: 'pending', addedAt: new Date().toISOString() }, ...prev])
  }, [])

  const removeDomain = useCallback((id) => {
    setDomains(prev => prev.filter(d => d.id !== id))
  }, [])

  const updateDomainStatus = useCallback((id, status) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }, [])

  const totalViews = pages.reduce((sum, p) => sum + (p.views || 0), 0)
  const totalBookings = pages.reduce((sum, p) => sum + (p.bookings || 0), 0)
  const overallConversion = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(1) : '—'

  return (
    <AppContext.Provider value={{
      pages, addPage, removePage, updatePage,
      apiKey, setApiKey,
      settings, setSettings,
      locations, addLocation, removeLocation, updateLocationStatus,
      domains, addDomain, removeDomain, updateDomainStatus,
      totalViews, totalBookings, overallConversion,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}