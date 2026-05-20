export default function ServicesSection({ content, css }) {
  const { heading, subtext, items = [] } = content
  return (
    <section className="py-24 px-6" style={{ backgroundColor: css.bg === '#ffffff' ? '#faf8f5' : adjust(css.bg, -5) }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full tracking-wider uppercase"
            style={{ backgroundColor: `${css.accent}15`, color: css.accent }}>
            Our Treatments
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: css.text }}>{heading}</h2>
          {subtext && <p className="text-gray-500 max-w-xl mx-auto">{subtext}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              style={{ borderRadius: css.radius }}>
              <div className="h-48 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold" style={{ color: css.text }}>{item.title}</h3>
                  <span className="font-bold text-lg" style={{ color: css.accent }}>{item.price}</span>
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
                {(item.bullets || []).length > 0 && (
                  <ul className="text-xs text-gray-400 space-y-1.5">
                    {item.bullets.map((b, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <span style={{ color: css.accent }}>✦</span> {b}
                      </li>
                    ))}
                  </ul>
                )}
                <a href="#"
                  className="block w-full text-center text-white py-2.5 text-sm font-semibold transition-all duration-200 mt-4"
                  style={{ backgroundColor: css.accent, borderRadius: css.radius }}
                  onClick={e => e.preventDefault()}>Book Now</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function adjust(hex, amount) {
  if (!hex || hex === '#ffffff') return '#f8f8f8'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}