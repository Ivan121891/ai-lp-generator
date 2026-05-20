export default function FooterSection({ content, css }) {
  const { brand, tagline, links = [], address, phone, email, hours } = content
  return (
    <footer className="py-12 px-6" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="text-white font-bold text-lg">{brand}</div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{tagline}</p>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {links.map((link, i) => (
              <li key={i}><a href={link.href} className="hover:text-white transition-colors">{link.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {address && <li>📍 {address}</li>}
            {phone && <li>📞 {phone}</li>}
            {email && <li>✉️ {email}</li>}
            {hours && <li>🕐 {hours}</li>}
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t border-white/10 mt-8 pt-8 text-xs text-center"
        style={{ color: 'rgba(255,255,255,0.4)' }}>
        © 2025 {brand}. All rights reserved.
      </div>
    </footer>
  )
}