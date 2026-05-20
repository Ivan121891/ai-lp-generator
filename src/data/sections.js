

export const SECTION_TYPES = [
  { id: 'hero', label: 'Hero', icon: '⬆', defaultSections: 1 },
  { id: 'services', label: 'Services', icon: '⊞', defaultSections: 1 },
  { id: 'testimonials', label: 'Testimonials', icon: '★', defaultSections: 1 },
  { id: 'stats', label: 'Stats Bar', icon: '▤', defaultSections: 1 },
  { id: 'faq', label: 'FAQ', icon: '?', defaultSections: 1 },
  { id: 'cta', label: 'CTA Banner', icon: '▣', defaultSections: 1 },
  { id: 'footer', label: 'Footer', icon: '⎔', defaultSections: 1 },
]

export const DEFAULT_SECTIONS = {
  hero: {
    id: 'hero',
    type: 'hero',
    visible: true,
    content: {
      headline: 'Your Brand',
      subtext: 'Tagline goes here',
      primaryCta: 'Get Started',
      secondaryCta: 'Learn More',
      bgStyle: 'dark',
      trustText: 'Trusted by 500+ clients',
      showTrustBar: true,
      showBadge: true,
      badgeText: 'Open Now',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    },
  },
  services: {
    id: 'services',
    type: 'services',
    visible: true,
    content: {
      heading: 'Our Services',
      subtext: 'Premium treatments tailored to you',
      items: [
        { title: 'Service One', price: '$199', description: 'Description of this amazing service.', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80', bullets: ['60 min session', 'Immediate results', 'No downtime'] },
        { title: 'Service Two', price: '$349', description: 'Another premium treatment option.', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80', bullets: ['45 min session', '3-5 sessions', 'Long-lasting'] },
        { title: 'Service Three', price: '$249', description: 'Expert care for lasting results.', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80', bullets: ['30 min session', 'Visible results', 'Custom plan'] },
      ],
    },
  },
  testimonials: {
    id: 'testimonials',
    type: 'testimonials',
    visible: true,
    content: {
      heading: 'What Our Clients Say',
      items: [
        { name: 'Sarah M.', quote: 'Amazing experience! Highly recommend.', rating: 5, service: 'Service 1', initials: 'SM' },
        { name: 'Jessica L.', quote: 'Results exceeded my expectations.', rating: 5, service: 'Service 2', initials: 'JL' },
        { name: 'Amanda K.', quote: 'Professional team, beautiful results.', rating: 5, service: 'Service 3', initials: 'AK' },
      ],
    },
  },
  stats: {
    id: 'stats',
    type: 'stats',
    visible: true,
    content: {
      heading: 'Built on Results',
      subtext: 'Numbers speak for themselves',
      items: [
        { value: '5,000+', label: 'Treatments' },
        { value: '500+', label: 'Clients' },
        { value: '4.9★', label: 'Rating' },
        { value: '12+', label: 'Years' },
      ],
    },
  },
  faq: {
    id: 'faq',
    type: 'faq',
    visible: true,
    content: {
      heading: 'Common Questions',
      items: [
        { question: 'Is there any downtime?', answer: "Most treatments have minimal downtime. We'll explain everything during your consultation." },
        { question: 'How many sessions do I need?', answer: 'Results vary. We create a personalized plan during your first visit.' },
        { question: 'What payment options are available?', answer: 'We accept cards, HSA/FSA, and offer financing through CareCredit.' },
      ],
    },
  },
  cta: {
    id: 'cta',
    type: 'cta',
    visible: true,
    content: {
      headline: 'Ready to Get Started?',
      subtext: 'Book your consultation today',
      primaryCta: 'Book Now',
      secondaryCta: 'Call Us',
      phone: '(555) 123-4567',
      bgImage: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80',
    },
  },
  footer: {
    id: 'footer',
    type: 'footer',
    visible: true,
    content: {
      brand: 'Your Brand',
      tagline: 'Premium services, personalized care.',
      links: [
        { label: 'Services', href: '#' },
        { label: 'About', href: '#' },
        { label: 'Book Now', href: '#' },
        { label: 'Contact', href: '#' },
      ],
      address: '123 Main St, City, State',
      phone: '(555) 123-4567',
      email: 'hello@yourbrand.com',
      hours: 'Mon-Sat 9AM-7PM',
    },
  },
}

export function getDefaultSectionsForPage() {
  return Object.values(DEFAULT_SECTIONS).map(s => ({
    ...JSON.parse(JSON.stringify(s)),
  }))
}

export function generateCSS(settings) {
  const accent = settings.accentColor || '#d85a30'
  const bg = settings.bgColor || '#ffffff'
  const text = settings.textColor || '#1a1a1a'
  const radius = settings.cornerRadius || 14
  return {
    accent,
    accentDark: adjustColor(accent, -20),
    accentLight: adjustColor(accent, 40),
    bg,
    text,
    radius: `${radius}px`,
  }
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
