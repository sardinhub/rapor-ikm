import { useState } from 'react'
import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  Award,
  Sparkles,
  Trophy,
  CalendarCheck,
  FileText,
  Scale,
  GraduationCap,
  LogOut,
  Cloud,
  CloudOff,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { cx } from './components/ui'
import { useStore } from './store'
import { useAuth } from './auth'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Sekolah from './pages/Sekolah'
import KelasSiswa from './pages/KelasSiswa'
import MapelNilai from './pages/MapelNilai'
import ProfilLulusan from './pages/ProfilLulusan'
import Kokurikuler from './pages/Kokurikuler'
import Ekskul from './pages/Ekskul'
import Kehadiran from './pages/Kehadiran'
import Rapor from './pages/Rapor'
import DasarHukum from './pages/DasarHukum'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'sekolah', label: 'Profil Sekolah', icon: School },
  { key: 'kelassiswa', label: 'Kelas & Siswa', icon: Users },
  { key: 'mapel', label: 'Mata Pelajaran & Nilai', icon: BookOpen },
  { key: 'profil', label: 'Profil Lulusan (8 Dimensi)', icon: Award },
  { key: 'kokurikuler', label: 'Kokurikuler', icon: Sparkles },
  { key: 'ekskul', label: 'Ekstrakurikuler', icon: Trophy },
  { key: 'kehadiran', label: 'Kehadiran', icon: CalendarCheck },
  { key: 'rapor', label: 'Rapor & Cetak', icon: FileText },
  { key: 'hukum', label: 'Dasar Hukum', icon: Scale },
]

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-sm">Memuat aplikasi...</p>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const { state, mode } = useStore()
  const { session, loading, role } = useAuth()
  const sekolah = state.sekolah
  const isAdmin = role === 'admin'

  if (supabase && loading) return <Splash />
  if (supabase && !session) return <Login />

  const PAGES = {
    dashboard: <Dashboard go={setPage} />,
    sekolah: <Sekolah />,
    kelassiswa: <KelasSiswa />,
    mapel: <MapelNilai />,
    profil: <ProfilLulusan />,
    kokurikuler: <Kokurikuler />,
    ekskul: <Ekskul />,
    kehadiran: <Kehadiran />,
    rapor: <Rapor />,
    admin: isAdmin ? <Admin /> : <Dashboard go={setPage} />,
    hukum: <DasarHukum />,
  }
  const pageAman = page === 'admin' && !isAdmin ? 'dashboard' : page

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <GraduationCap size={22} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">Rapor IKM</p>
            <p className="truncate text-[11px] text-slate-500">{sekolah.nama}</p>
          </div>
        </div>

        {/* Status koneksi */}
        <div className="border-b border-slate-200 px-5 py-2">
          {mode === 'checking' && (
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Loader2 size={12} className="animate-spin" /> Menghubungkan database...
            </span>
          )}
          {mode === 'online' && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <Cloud size={12} /> Tersinkron online
            </span>
          )}
          {mode === 'local' && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
              <CloudOff size={12} /> Mode lokal (tanpa database)
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={cx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                page === key ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <Icon size={17} />
              <span className="truncate">{label}</span>
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => setPage('admin')}
              className={cx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                pageAman === 'admin' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <ShieldCheck size={17} />
              <span className="truncate">Admin — Pengguna &amp; Akses</span>
            </button>
          )}
        </nav>

        <div className="border-t border-slate-200 px-5 py-3">
          {session?.user?.email && (
            <p className="mb-2 truncate text-[11px] text-slate-500">Masuk sebagai: {session.user.email}</p>
          )}
          {supabase && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={13} /> Keluar
            </button>
          )}
          <p className="text-[11px] leading-relaxed text-slate-400">
            Data tersimpan di database &amp; lokal. Gunakan menu Rapor untuk mencetak.
          </p>
        </div>
      </aside>

      {/* Konten */}
      <main className="ml-64 min-h-screen">
        <div className="mx-auto max-w-6xl px-8 py-8">{PAGES[pageAman] || PAGES.dashboard}</div>
      </main>
    </div>
  )
}
