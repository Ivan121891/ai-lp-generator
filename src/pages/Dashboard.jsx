import { Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'

export default function Dashboard() {
  const { pages, totalViews, totalBookings, overallConversion } = useApp()

  const recentPages = pages.slice(0, 5)

  const conversionRate = (page) => {
    if (!page.views) return '—'
    return ((page.bookings / page.views) * 100).toFixed(1) + '%'
  }

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">Total pages</div>
          <div className="text-3xl font-bold">{pages.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">Total views</div>
          <div className="text-3xl font-bold">{totalViews}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">Total leads</div>
          <div className="text-3xl font-bold">{totalBookings}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">Avg. conversion</div>
          <div className="text-3xl font-bold">{overallConversion}{overallConversion !== '—' ? '%' : ''}</div>
        </div>
      </div>

      {/* Page Performance */}
      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Page performance</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Page</th>
              <th className="px-6 py-3 font-medium w-20 text-right">Views</th>
              <th className="px-6 py-3 font-medium w-20 text-right">Leads</th>
              <th className="px-6 py-3 font-medium w-24 text-right">Conv. rate</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                  No pages generated yet.{' '}
                  <Link to="/pages" className="text-[#d85a30] hover:underline">Generate your first page</Link>
                </td>
              </tr>
            ) : (
              pages.map(page => (
                <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link to={`/pages/${page.id}`} className="text-gray-900 hover:text-[#d85a30] font-medium">
                      {page.title || 'Untitled'}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-right">{page.views || 0}</td>
                  <td className="px-6 py-3 text-right">{page.bookings || 0}</td>
                  <td className="px-6 py-3 text-right">{conversionRate(page)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recent pages */}
      {pages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent pages</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPages.map(page => (
              <div key={page.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <Link to={`/pages/${page.id}`} className="text-sm font-medium text-gray-900 hover:text-[#d85a30]">
                    {page.title || 'Untitled'}
                  </Link>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(page.createdAt).toLocaleDateString()} · {page.views} views
                  </div>
                </div>
                <Link
                  to={`/pages/${page.id}`}
                  className="text-xs text-[#d85a30] hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}