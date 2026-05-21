import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext()

const STORAGE_KEYS = {
  pages: 'ailp-pages',
  apiKey: 'ailp-api-key',
  settings: 'ailp-settings',
  locations: 'ailp-locations',
  domains: 'ailp-domains',
  publishUrl: 'ailp-publish-url',
}

function createDefaultPage() {
  return {
    id: crypto.randomUUID(),
    title: 'New booking page',
    slug: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    views: 0,
    bookings: 0,

    // Styling
    accentColor: '#d85a30',
    bgColor: '#ffffff',
    textColor: '#1a1a1a',
    headingColor: '#1a1a1a',
    subtitleColor: '#6b7280',
    buttonTextColor: '#ffffff',
    cornerRadius: 14,
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingSize: 18,
    bodySize: 14,
    buttonStyle: 'filled',
    headingWeight: '700',
    bodyWeight: '400',

    // GHL connection
    locationId: null,
    calendarId: null,
    assignedUserId: null,

    // Tracking
    googleAnalyticsId: '',
    facebookPixelId: '',

    // Booking flow content
    steps: {
      heroDate: {
        enabled: true,
        headline: 'Non-Surgical Face and Neck Lift Treatment',
        subtitle: 'Sculpt your jawline and smooth your neckline',
        ctaText: 'BOOK NOW',
        urgencyText: 'Limited spots this week',
        showUrgencyBanner: true,
        heroImage: '',
        dateLabelFormat: '{dayOfWeek}, {monthName} {day}',
        helperText: 'Tap a date to pick a time',
      },
      time: {
        enabled: true,
        heading: 'Select a time',
        helperText: 'All times - {slotCount} available',
        showChangeDateBack: true,
      },
      form: {
        enabled: true,
        heading: 'Almost done',
        helperText: 'Enter your details to confirm',
        buttonText: 'Confirm appointment',
        privacyText: 'Your info is secure · never shared',
      },
      confirmation: {
        enabled: true,
        heading: "You're booked!",
        message: 'A text confirmation is on its way.',
        showBookingReference: false,
      },
    },

    // Service/price block
    service: {
      show: true,
      name: 'Treatment name',
      description: 'Treatment description',
      price: '$129',
      period: 'per session',
    },

    // Before/after gallery
    gallery: {
      show: false,
      heading: 'Real results',
      pairs: [],
    },

    // Business info
    businessName: '',
    address: '',
    phone: '',
    showFooter: true,

    // Published
    publishedUrl: '',
    publishedAt: null,
  }
}

export function AppProvider({ children }) {
  const [pages, setPages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.pages)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.apiKey) || ''
  })

  const [settings, setSettings] = useState(() => {
    try {
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
    } catch {
      return {
        accentColor: '#d85a30',
        accentTextColor: '#ffffff',
        bgColor: '#ffffff',
        textColor: '#1a1a1a',
        cornerRadius: 14,
        headingFont: 'Inter',
        model: 'openai/gpt-4o-mini',
      }
    }
  })

  const [locations, setLocations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.locations)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [domains, setDomains] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.domains)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [publishUrl, setPublishUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.publishUrl) || 'http://localhost:3008'
  })

  // Persist all state
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.publishUrl, publishUrl)
  }, [publishUrl])

  const addPage = useCallback((overrides = {}) => {
    const page = { ...createDefaultPage(), ...overrides, id: overrides.id || crypto.randomUUID() }
    setPages(prev => [page, ...prev])
    return page.id
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
      publishUrl, setPublishUrl,
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