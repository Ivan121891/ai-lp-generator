import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'

export default function Pages() {
  const { pages, removePage, addPage } = useApp()
  const navigate = useNavigate()

  const createPage = () => {
    const id = crypto.randomUUID()
    addPage({ id, title: 'New booking page' })
    navigate(`/pages/${id}`)
  }

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Landing pages</h1>
          <p className="text-sm text-gray-500 mt-1">Build and manage your booking pages</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={createPage}
            className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
          >
            + New page
          </button>
        </div>
      </div>

      {/* Pages list */}
      <div className="space-y-2">
        {pages.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No pages yet</h3>
            <p className="text-sm text-gray-400 mb-4">Create a 3-tap booking page to start collecting appointments</p>
            <button
              onClick={createPage}
              className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer"
            >
              + New page
            </button>
          </div>
        )}

        {pages.map(page => (
          <div
            key={page.id}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
                📅
              </div>
              <div className="min-w-0">
                <Link to={`/pages/${page.id}`} className="text-sm font-medium text-gray-900 hover:text-[#d85a30]">
                  {page.title || 'Untitled'}
                </Link>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                    page.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.status === 'live' ? 'Live' : 'Draft'}
                  </span>
                  <span>·</span>
                  <span>{page.views || 0} views</span>
                  <span>·</span>
                  <span>{page.bookings || 0} bookings</span>
                  {page.slug && (
                    <>
                      <span>·</span>
                      <span className="text-gray-300 font-mono">/{page.slug}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Link
                to={`/pages/${page.id}`}
                className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => {
                  if (confirm('Delete this page?')) removePage(page.id)
                }}
                className="px-4 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}