import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import { AuthProvider, useAuth } from './auth.jsx'

// Store di-remount setiap kali NPSN berubah (login / ganti sekolah)
// agar state & cache lokal selalu milik sekolah yang sedang aktif.
function Providers() {
  const { npsn } = useAuth()
  return (
    <StoreProvider key={npsn || 'local'} npsn={npsn}>
      <App />
    </StoreProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Providers />
    </AuthProvider>
  </StrictMode>,
)
