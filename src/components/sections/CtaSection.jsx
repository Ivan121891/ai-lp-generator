export default function CtaSection({ content, css }) {
  const { headline, subtext, primaryCta, secondaryCta, phone, bgImage } = content
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.6), rgba(0,0,0,0.8))' }} />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center text-white space-y-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15]">{headline}</h2>
        {subtext && <p className="text-lg text-white/70 max-w-xl mx-auto">{subtext}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {primaryCta && (
            <a href="#"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: css.accent, borderRadius: css.radius }}
              onClick={e => e.preventDefault()}>
              {primaryCta}
            </a>
          )}
          {secondaryCta && (
            <a href="#"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white px-8 py-3.5 text-sm font-semibold transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: css.radius }}
              onClick={e => e.preventDefault()}>
              {secondaryCta}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}