import { useAuth } from './context/AuthContext.jsx'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute({ requiredRoles = [] }) {
  const { loading, isAuthenticated, user } = useAuth()

  if (loading)
    return (
      <div className="bg-zinc-800 w-full h-screen flex justify-center items-center">
        <h1 className="text-white text-2xl">Loading...</h1>
      </div>
    )

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
