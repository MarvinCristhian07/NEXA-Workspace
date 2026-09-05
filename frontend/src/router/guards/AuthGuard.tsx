/**
 * AuthGuard - protege rotas que exigem autenticação
 * Redireciona para /login se não autenticado
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PATHS } from '../paths';

export function AuthGuard() {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Salva a rota original para redirecionar após login
        return (
            <Navigate
                to={PATHS.LOGIN}
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
}