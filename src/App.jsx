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
  Menu,
  X,
} from 'lucide-react'
import { cx } from './components/ui'
import { useStore } from './store'
import { useAuth } from './auth'
import { supabase } from './lib/supabase'
import Login, { NpsnGate } from './pages/Login'
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

function StatusBadge({ mode }) {
  if (mode === 'checking') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Loader2 size={12} className="animate-spin" /> Menghubungkan...
      </span>
    )
  }
  if (mode === 'online') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
        <Cloud size={12} /> Tersinkron online
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
      <CloudOff size={12} /> Mode lokal
    </span>
  )
}

function SidebarContent({ page, pageAman, isAdmin, session, onNavigate }) {
  const { state, mode } = useStore()
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <GraduationCap size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">Rapor IKM</p>
          <p className="truncate text-[11px] text-slate-500">
            {state.sekolah.nama || (state.sekolah.npsn ? `NPSN ${state.sekolah.npsn}` : 'Belum ada sekolah')}
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200 px-5 py-2">
        <StatusBadge mode={mode} />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={cx(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
              pageAman === key ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            <Icon size={17} />
            <span className="truncate">{label}</span>
          </button>
        ))}
        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
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
        {session?.user?.email && <p className="mb-2 truncate text-[11px] text-slate-500">Masuk sebagai: {session.user.email}</p>}
        {supabase && (
          <button
            onClick={() => supabase.auth.signOut()}
            className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={13} /> Keluar
          </button>
        )}
        <p className="text-[11px] leading-relaxed text-slate-400">Data tersimpan otomatis ke database (online); salinan lokal hanya cadangan. Gunakan menu Rapor untuk mencetak.</p>
      </div>
    </div>
  )
}

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
  const [menuOpen, setMenuOpen] = useState(false)
  const { state, mode } = useStore()
  const { session, loading, role, npsn } = useAuth()
  const sekolah = state.sekolah
  const isAdmin = role === 'admin'

  if (supabase && loading) return <Splash />
  if (supabase && !session) return <Login />
  if (supabase && session && !npsn) return <NpsnGate />

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

  const navigasi = (key) => {
    setPage(key)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Bar atas mobile / tablet */}
      <header className="no-print fixed inset-x-0 top-0 z-40 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Buka menu"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 active:scale-95"
        >
          <Menu size={22} />
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <GraduationCap size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-slate-900">Rapor IKM</p>
            <p className="truncate text-[10px] text-slate-500">{sekolah.nama || (npsn ? `NPSN ${npsn}` : '')}</p>
          </div>
        </div>
        <div className="ml-auto pr-1">
          <StatusBadge mode={mode} />
        </div>
      </header>

      {/* Sidebar desktop */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent page={page} pageAman={pageAman} isAdmin={isAdmin} session={session} onNavigate={navigasi} />
      </aside>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup menu"
              className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
            <SidebarContent page={page} pageAman={pageAman} isAdmin={isAdmin} session={session} onNavigate={navigasi} />
          </div>
        </div>
      )}

      {/* Konten */}
      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="h-14 lg:hidden" aria-hidden="true" />
          {PAGES[pageAman] || PAGES.dashboard}
        </div>
      </main>
    </div>
  )
}
