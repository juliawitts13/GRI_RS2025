import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AppShell } from '@/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { IndicadoresPage } from '@/pages/IndicadoresPage'
import { RespondentesPage } from '@/pages/RespondentesPage'
import { CronogramaPage } from '@/pages/CronogramaPage'

function ProtectedRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50">
        <p className="text-sm text-navy-700/70">Carregando...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="indicadores" element={<IndicadoresPage />} />
        <Route path="respondentes" element={<RespondentesPage />} />
        <Route path="cronograma" element={<CronogramaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
