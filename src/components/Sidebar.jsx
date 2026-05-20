import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◻' },
  { to: '/pages', label: 'Pages', icon: '◰' },
  { to: '/locations', label: 'Locations', icon: '◉' },
  { to: '/domains', label: 'Domains', icon: '◌' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
  { to: '/help', label: 'Help', icon: '?' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 h-screen bg-[#1a1a1a] text-white flex flex-col border-r border-[#2a2a2a]">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d85a30] flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight">AI LP Generator</div>
            <div className="text-[10px] text-gray-500">Landing pages</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#d85a30]/10 text-[#d85a30]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#2a2a2a]">
        <div className="text-[11px] text-gray-600">AI LP Generator v1.0</div>
      </div>
    </aside>
  )
}