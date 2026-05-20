export default function FaqSection({ content, css }) {
  const { heading, items = [] } = content
  return (
    <section className="py-24 px-6" style={{ backgroundColor: css.bg === '#ffffff' ? '#faf8f5' : adjust(css.bg, -5) }}>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full tracking-wider uppercase"
            style={{ backgroundColor: `${css.accent}15`, color: css.accent }}>
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: css.text }}>{heading}</h2>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <details key={i} className="bg-white p-5 group cursor-pointer" style={{ borderRadius: css.radius }}>
              <summary className="flex items-center justify-between text-sm font-semibold list-none" style={{ color: css.text }}>
                {item.question}
                <span className="group-open:rotate-180 transition-transform text-xs" style={{ color: css.accent }}>▼</span>
              </summary>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">{item.answer}</p>
            </details>
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