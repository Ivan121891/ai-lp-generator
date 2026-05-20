export default function TestimonialsSection({ content, css }) {
  const { heading, items = [] } = content
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full tracking-wider uppercase"
            style={{ backgroundColor: `${css.accent}15`, color: css.accent }}>
            Real Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: css.text }}>{heading}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className="p-6 space-y-4"
              style={{ backgroundColor: css.bg === '#ffffff' ? '#faf8f5' : adjust(css.bg, -3), borderRadius: css.radius }}>
              <div className="flex" style={{ color: css.accent }}>
                {'★'.repeat(item.rating || 5)}{'☆'.repeat(5 - (item.rating || 5))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">"{item.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${css.accent}, ${css.accentLight})` }}>
                  {item.initials || item.name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: css.text }}>{item.name}</div>
                  <div className="text-xs text-gray-400">{item.service}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
function adjust(hex, amount) {
  if (!hex) return '#f0f0f0'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}