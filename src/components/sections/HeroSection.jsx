export default function HeroSection({ content, css }) {
  const { headline, subtext, primaryCta, secondaryCta, trustText, showTrustBar, showBadge, badgeText, image, bgStyle } = content

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden"
      style={{
        background: bgStyle === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2418 50%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f5f5f5 100%)',
      }}
    >
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ backgroundColor: `${css.accent}10` }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ backgroundColor: `${css.accent}08` }} />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            {showBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium tracking-wider uppercase"
                style={{ color: css.accent, borderColor: `${css.accent}30` }}>
                ✦ {badgeText}
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
              style={{ color: bgStyle === 'dark' ? '#ffffff' : css.text }}>
              {headline}
            </h1>

            {subtext && (
              <p className="text-lg max-w-lg"
                style={{ color: bgStyle === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                {subtext}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              {primaryCta && (
                <a href="#book"
                  className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: css.accent, borderRadius: css.radius }}
                  onClick={e => e.preventDefault()}>
                  {primaryCta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              )}
              {secondaryCta && (
                <a href="#"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    color: bgStyle === 'dark' ? 'rgba(255,255,255,0.8)' : css.text,
                    border: `1px solid ${bgStyle === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                    borderRadius: css.radius,
                  }}
                  onClick={e => e.preventDefault()}>
                  {secondaryCta}
                </a>
              )}
            </div>

            {showTrustBar && (
              <div className="flex items-center gap-4 text-xs"
                style={{ color: bgStyle === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                <div className="flex -space-x-2">
                  {['JD', 'SK', 'ML'].map((init, i) => (
                    <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 text-white"
                      style={{
                        borderColor: bgStyle === 'dark' ? '#1a1a1a' : '#ffffff',
                        background: `linear-gradient(135deg, ${css.accent}, ${css.accentLight})`,
                      }}>{init}</div>
                  ))}
                </div>
                <span dangerouslySetInnerHTML={{ __html: trustText }} />
              </div>
            )}
          </div>

          {/* Right: Image */}
          <div className="relative hidden lg:block">
            {image && (
              <div className="relative overflow-hidden shadow-2xl"
                style={{ borderRadius: css.radius }}>
                <img src={image} alt="" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 backdrop-blur-xl border border-white/10 p-4"
                  style={{
                    borderRadius: css.radius,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${css.accent}20`, border: `1px solid ${css.accent}30` }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                        style={{ color: css.accent }}>
                        <path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">Next available today</div>
                      <div className="text-white/60 text-xs">2:30 PM · 45 min session</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}