import { useState, useMemo, useEffect, useCallback } from 'react'

const WEEKDAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']

function getWeekDates() {
  const today = new Date()
  const dates = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d)
  }
  return dates
}

function formatDay(d) {
  return { dayName: WEEKDAYS[d.getDay()], dayNum: d.getDate(), month: d.getMonth(), date: d }
}

function formatDateLong(d) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
}

function toDateStr(d) {
  return d.toISOString().split('T')[0]
}

export default function BookingFlow({ page, settings, locations }) {
  const steps = page.steps || {}
  const service = page.service || {}
  const accentColor = page.accentColor || settings?.accentColor || '#d85a30'
  const bgColor = page.bgColor || settings?.bgColor || '#ffffff'
  const headingColor = page.headingColor || '#1a1a1a'
  const subtitleColor = page.subtitleColor || '#6b7280'
  const buttonTextColor = page.buttonTextColor || '#ffffff'
  const cornerRadius = page.cornerRadius || settings?.cornerRadius || 14
  const headingFont = page.headingFont || settings?.headingFont || 'Inter'
  const bodyFont = page.bodyFont || settings?.bodyFont || 'Inter'
  const headingSize = page.headingSize || settings?.headingSize || 18
  const bodySize = page.bodySize || settings?.bodySize || 14
  const buttonStyle = page.buttonStyle || 'filled'
  const headingWeight = page.headingWeight || '700'
  const bodyWeight = page.bodyWeight || '400'

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Lora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Instrument+Sans:wght@300;400;500;600;700;800&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' })
  const [timeSlots, setTimeSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  const weekDates = useMemo(() => getWeekDates(), [])

  const heroStep = steps.heroDate || {}
  const timeStep = steps.time || {}
  const formStep = steps.form || {}
  const confirmStep = steps.confirmation || {}

  // Look up connected location for GHL API calls
  const connectedLocation = useMemo(() => {
    if (!locations) return null
    return locations.find(l => l.id === page.locationId)
  }, [locations, page.locationId])

  // Fetch real time slots from GHL calendar
  const fetchTimeSlots = useCallback(async (date) => {
    if (!page.calendarId || !connectedLocation?.pitToken || !connectedLocation?.ghlLocationId) return

    setLoadingSlots(true)
    setSlotsError('')
    setTimeSlots([])

    const dateStr = toDateStr(date)

    try {
      let url = `https://services.leadconnectorhq.com/calendars/${page.calendarId}/free-slots?locationId=${connectedLocation.ghlLocationId}&startDate=${dateStr}&endDate=${dateStr}`
      if (page.assignedUserId) {
        url += `&userId=${page.assignedUserId}`
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${connectedLocation.pitToken}`,
          'Version': '2021-04-15',
        },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Slots API returned ${res.status}`)
      }

      const data = await res.json()

      // Parse slots from GHL response
      const slots = []
      if (data[dateStr] && Array.isArray(data[dateStr])) {
        data[dateStr].forEach(slot => {
          if (slot.slot && slot.slot.startTime) {
            // Format to readable time
            const t = formatTime(slot.slot.startTime)
            if (t) slots.push(t)
          }
        })
      }

      // Fallback: if no slots returned, use the raw data structure
      if (slots.length === 0 && Array.isArray(data)) {
        data.forEach(slot => {
          if (typeof slot === 'string') {
            const t = formatTime(slot)
            if (t) slots.push(t)
          } else if (slot.startTime) {
            const t = formatTime(slot.startTime)
            if (t) slots.push(t)
          }
        })
      }

      // Deduplicate and sort
      const unique = [...new Set(slots)]
      unique.sort()

      setTimeSlots(unique.length > 0 ? unique : [])
    } catch (err) {
      setSlotsError(err.message)
      setTimeSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [page.calendarId, page.assignedUserId, connectedLocation])

  const handleDateSelect = (d) => {
    setSelectedDate(d)
    setSelectedTime(null)
    setCurrentStep(1)
    // Fetch real slots when date is selected
    if (page.calendarId && connectedLocation) {
      fetchTimeSlots(d)
    }
  }

  const handleTimeSelect = (t) => {
    setSelectedTime(t)
    setCurrentStep(2)
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setCurrentStep(3)
    if (page.onBook) page.onBook()
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const accentStyle = { '--accent': accentColor, '--accent-dark': adjustColor(accentColor, -20), '--radius': `${cornerRadius}px` }

  return (
    <div
      className="booking-flow w-full max-w-sm mx-auto bg-white overflow-hidden"
      style={{ fontFamily: `'${bodyFont}', 'Inter', system-ui, sans-serif`, ...accentStyle }}
    >
      {/* Progress steps */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-2">
        {['Date', 'Time', 'Details', 'Done'].map((label, i) => (
          <div key={label} className="flex-1 flex items-center">
            <div className={`text-[10px] font-semibold uppercase tracking-wider ${
              i <= currentStep ? 'opacity-100' : 'opacity-30'
            }`} style={{ color: i <= currentStep ? accentColor : subtitleColor }}>
              {label}
            </div>
            {i < 3 && <div className="flex-1 h-px ml-1" style={{ backgroundColor: i < currentStep ? accentColor : '#e5e7eb' }} />}
          </div>
        ))}
      </div>

      {/* Urgency banner */}
      {heroStep.showUrgencyBanner !== false && heroStep.urgencyText && currentStep < 2 && (
        <div
          className="text-center text-sm font-semibold text-white py-2.5 px-4"
          style={{ backgroundColor: '#ea580c' }}
        >
          {heroStep.urgencyText}
        </div>
      )}

      {/* Step 0: Hero + Date Selection */}
      {currentStep === 0 && (
        <div className="animate-fade-in">
          {/* Hero image */}
          {heroStep.heroImage && (
            <div className="relative h-72 overflow-hidden">
              <img
                src={heroStep.heroImage}
                alt=""
                className="w-full h-full object-cover"
              />
              {/* CTA badge */}
              {heroStep.ctaText && (
                <span className="absolute top-3 left-3 text-xs font-semibold tracking-wider uppercase text-gray-800 bg-white/80 backdrop-blur-sm rounded px-3 py-1">
                  {heroStep.ctaText}
                </span>
              )}
              {/* Price overlay */}
              {service.show !== false && service.price && (
                <span className="absolute bottom-3 right-3 text-lg font-bold text-white bg-black/40 backdrop-blur-sm rounded px-3 py-1">
                  {service.price}
                </span>
              )}
              {/* Headline over image */}
              <div className="absolute bottom-3 left-3 right-16">
                <h1 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
                  {heroStep.headline}
                </h1>
              </div>
            </div>
          )}

          {/* No image fallback */}
          {!heroStep.heroImage && (
            <div className="px-4 pt-4">
              <h1 className="text-xl font-bold" style={{ color: headingColor }}>{heroStep.headline}</h1>
              {heroStep.subtitle && (
                <p className="text-sm mt-1" style={{ color: subtitleColor }}>{heroStep.subtitle}</p>
              )}
            </div>
          )}

          {/* Service card */}
          {service.show !== false && (
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold" style={{ color: headingColor }}>{service.name}</h3>
                  {service.description && (
                    <p className="text-xs" style={{ color: subtitleColor }}>{service.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-base font-bold" style={{ color: '#ea580c' }}>{service.price}</div>
                  {service.period && <div className="text-[10px] text-gray-400">{service.period}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Date grid */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => {}} className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <p className="text-xs" style={{ color: subtitleColor }}>{heroStep.helperText || 'Tap a date to pick a time'}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {weekDates.slice(0, 8).map((d, i) => {
                const { dayName, dayNum } = formatDay(d)
                const isToday = i === 0
                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(d)}
                    className="flex flex-col items-center py-2.5 px-1 rounded-lg border transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
                    style={{
                      borderColor: selectedDate?.getTime() === d.getTime() ? accentColor : '#e5e7eb',
                      backgroundColor: selectedDate?.getTime() === d.getTime() ? `${accentColor}10` : 'white',
                    }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{dayName}</span>
                    <span className="text-base font-bold mt-0.5" style={{ color: isToday ? accentColor : headingColor }}>{dayNum}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center">
              {heroStep.dateLabelFormat || '{dayOfWeek}, {monthName} {day}'}
            </p>
          </div>
        </div>
      )}

      {/* Step 1: Time Selection */}
      {currentStep === 1 && (
        <div className="px-4 py-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">Selected date</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: headingColor }}>
                {selectedDate ? formatDateLong(selectedDate) : ''}
              </p>
            </div>
            {timeStep.showChangeDateBack !== false && (
              <button
                onClick={handleBack}
                className="text-xs font-medium underline cursor-pointer"
                style={{ color: accentColor }}
              >
                Change date
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-3">
            {loadingSlots
              ? 'Loading available times...'
              : slotsError
                ? 'Could not load times'
                : timeStep.helperText || 'Select a time'
            }
          </p>

          {loadingSlots && (
            <div className="text-center py-8 text-sm text-gray-400">
              <svg className="w-5 h-5 animate-spin mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              Fetching availability...
            </div>
          )}

          {slotsError && !loadingSlots && (
            <div className="text-xs text-red-500 mb-3 p-2 bg-red-50 rounded-lg">{slotsError}</div>
          )}

          {!loadingSlots && !slotsError && timeSlots.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((t, i) => (
                <button
                  key={i}
                  onClick={() => handleTimeSelect(t)}
                  className="py-2.5 text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    borderColor: selectedTime === t ? accentColor : '#e5e7eb',
                  color: selectedTime === t ? buttonTextColor : headingColor,
                  backgroundColor: selectedTime === t ? accentColor : 'white',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {!loadingSlots && !slotsError && timeSlots.length === 0 && !page.calendarId && (
            <div className="text-center py-8 text-sm text-gray-400">
              No calendar connected. Select a calendar in the Calendar tab to see available times.
            </div>
          )}

          {!loadingSlots && !slotsError && timeSlots.length === 0 && page.calendarId && selectedDate && (
            <div className="text-center py-8 text-sm text-gray-400">
              No available slots for this date. Try another day.
              <br />
              <button onClick={() => fetchTimeSlots(selectedDate)} className="text-[#d85a30] hover:underline text-xs mt-2 cursor-pointer">
                ↻ Refresh
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Form */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit} className="px-4 py-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <button type="button" onClick={handleBack} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div>
              <p className="text-sm font-semibold" style={{ color: headingColor }}>
                {formStep.heading || 'Almost done'}
              </p>
              <p className="text-xs" style={{ color: subtitleColor }}>{formStep.helperText || 'Enter your details to confirm'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              required
              placeholder="Full name"
              value={formData.name}
              onChange={e => handleFormChange('name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none"
            />
            <input
              required
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={e => handleFormChange('email', e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none"
            />
            <input
              required
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={e => handleFormChange('phone', e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none"
            />
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={e => handleFormChange('notes', e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none"
            />
          </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98] cursor-pointer"
              style={{ ...getButtonStyle(buttonStyle, accentColor, buttonTextColor), borderRadius: cornerRadius }}
            >
            {formStep.buttonText || 'Confirm appointment'}
          </button>

          {formStep.privacyText && (
            <p className="text-[10px] text-gray-400 text-center mt-3">{formStep.privacyText}</p>
          )}
        </form>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && (
        <div className="px-4 py-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold" style={{ color: headingColor }}>
            {confirmStep.heading || "You're booked!"}
          </h2>
          <p className="text-sm" style={{ color: subtitleColor }}>
            {confirmStep.message || 'A text confirmation is on its way.'}
          </p>

          {selectedDate && selectedTime && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold" style={{ color: headingColor }}>
                {service.name}
              </div>
              <div className="text-xs" style={{ color: subtitleColor }}>
                <div>{selectedDate ? formatDateLong(selectedDate) : ''}</div>
                <div>{selectedTime}</div>
              </div>
            </div>
          )}

          {confirmStep.showBookingReference && (
            <div className="mt-4 text-xs text-gray-400">
              Reference: APT-{Math.random().toString(36).slice(2, 7).toUpperCase()}
            </div>
          )}

          {/* Business info */}
          {page.showFooter !== false && (page.businessName || page.address || page.phone) && (
            <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400">
              {page.businessName && <div className="font-semibold">{page.businessName}</div>}
              {page.address && <div className="mt-0.5">{page.address}</div>}
              {page.phone && <div className="mt-0.5">{page.phone}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatTime(timeStr) {
  if (!timeStr) return null
  try {
    let hours, minutes
    if (timeStr.includes('T')) {
      const parts = timeStr.split('T')[1].split(':')
      hours = parseInt(parts[0], 10)
      minutes = parseInt(parts[1], 10)
    } else if (timeStr.includes(':')) {
      const parts = timeStr.split(':')
      hours = parseInt(parts[0], 10)
      minutes = parseInt(parts[1], 10)
    } else {
      return timeStr
    }
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h = hours % 12 || 12
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`
  } catch {
    return timeStr
  }
}

function getButtonStyle(style, accent, buttonTextColor) {
  switch (style) {
    case 'outline':
      return { border: `2px solid ${accent}`, color: accent, backgroundColor: 'transparent' }
    case 'ghost':
      return { color: accent, backgroundColor: 'transparent' }
    case 'soft':
      return { color: accent, backgroundColor: `${accent}15` }
    case 'filled':
    default:
      return { color: buttonTextColor, backgroundColor: accent }
  }
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}