/**
 * GuestGuard - bloqueia usuários já logados de acessar /login
 * Redireciona para /dashboard se já autenticado
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PATHS } from '../paths';

export function GuestGuard() {
  const { isAuthenticated, isMfaPending } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  // Usuário com MFA pendente só pode acessar /auth/mfa
  if (isMfaPending) {
    return <Navigate to={PATHS.MFA} replace />;
  }

  return <Outlet />;
}