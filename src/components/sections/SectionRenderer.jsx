import HeroSection from './HeroSection'
import ServicesSection from './ServicesSection'
import TestimonialsSection from './TestimonialsSection'
import StatsSection from './StatsSection'
import FaqSection from './FaqSection'
import CtaSection from './CtaSection'
import FooterSection from './FooterSection'

const renderers = {
  hero: HeroSection,
  services: ServicesSection,
  testimonials: TestimonialsSection,
  stats: StatsSection,
  faq: FaqSection,
  cta: CtaSection,
  footer: FooterSection,
}

export default function SectionRenderer({ sections, css, onSelectSection, selectedSectionId }) {
  const visible = sections.filter(s => s.visible !== false)

  return (
    <div className="font-sans antialiased">
      {visible.map((section) => {
        const Component = renderers[section.type]
        if (!Component) return null
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection?.(section.id)}
            className={`relative cursor-pointer transition-all ${
              selectedSectionId === section.id
                ? 'ring-2 ring-[#d85a30] ring-offset-2'
                : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
            }`}
          >
            {selectedSectionId === section.id && (
              <div className="absolute top-2 left-2 z-50 bg-[#d85a30] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                Editing
              </div>
            )}
            <Component content={section.content} css={css} />
          </div>
        )
      })}
    </div>
  )
}