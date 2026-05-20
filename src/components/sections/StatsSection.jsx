export default function StatsSection({ content, css }) {
  const { heading, subtext, items = [] } = content
  return (
    <section className="py-20 px-6" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-6xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{heading}</h2>
          {subtext && <p className="text-white/60 max-w-xl mx-auto">{subtext}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div key={i}>
              <div className="text-3xl font-bold" style={{ color: css.accent }}>{item.value}</div>
              <div className="text-sm text-white/40 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}