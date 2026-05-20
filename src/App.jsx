import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Pages from './pages/Pages'
import PageEditor from './pages/PageEditor'
import Locations from './pages/Locations'
import Domains from './pages/Domains'
import Settings from './pages/Settings'
import Help from './pages/Help'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="flex h-screen bg-white">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#f5f5f5]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pages" element={<Pages />} />
              <Route path="/pages/:id" element={<PageEditor />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/domains" element={<Domains />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </main>
        </div>
      </AppProvider>
    </BrowserRouter>
  )
}