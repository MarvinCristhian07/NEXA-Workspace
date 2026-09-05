/**
 * Configuração central do roteamento
 * 
 * Estratégia:
 * - Lazy loading em todas as páginas (code splitting automático)
 * - Guards por camada (auth / guest)
 * - Suspense com fallback de loading
 * - Tratamento de rotas não encontradas (404)
 */
import { lazy, Suspense } from 'react';
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from 'react-router-dom';

import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';
import { PATHS } from './paths';
import { PageLoader } from '@components/ui/PageLoader';

// Lazy imports - cada página é um chunk separado
const LoginPage = lazy(() =>
    import('@features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const MfaPage = lazy(() =>
  import('@features/auth/pages/MfaPage').then((m) => ({ default: m.MfaPage }))
);
const DashboardPage = lazy(() =>
  import('@features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const AuthLayout = lazy(() =>
  import('@features/auth/layouts/AuthLayout').then((m) => ({ default: m.AuthLayout }))
);

const router = createBrowserRouter([
    // Redireciona raiz para /login
    {
        path: '/',
        element: <Navigate to={PATHS.LOGIN} replace />,
    },

    // Rotas de autenticação (guest only)
    {
        element: <GuestGuard />,
        children: [
            {
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <AuthLayout />
                    </Suspense>
                ),
                children: [
                    {
                        path: PATHS.LOGIN,
                        element: (
                            <Suspense fallback={<PageLoader />}>
                                <LoginPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: PATHS.REGISTER,
                        element: (
                            <Suspense fallback={<PageLoader />}>
                                <RegisterPage />
                            </Suspense>
                        ),
                    },
                ],
            },
        ],
    },

    // Rota MFA (acesso livre - validada internamente)
    {
        path: PATHS.MFA,
        element: (
            <Suspense fallback={<PageLoader />}>
                <MfaPage />
            </Suspense>
        ),
    },

    // Rotas protegidas (auth required)
    {
        element: <AuthGuard />,
        children: [
            {
                path: PATHS.DASHBOARD,
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <DashboardPage />
                    </Suspense>
                ),
            },
        ],
    },

    // 404
    {
        path: '*',
        element: (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '16px',
                fontFamily: 'Inter, sans-serif'
            }}>
                <span style={{ fontSize: '48px', fontWeight: 600, color: '#1E2440' }}>404</span>
                <span style={{ fontSize: '16px', color: '#515A77' }}>Página não encontrada</span>
                <a href={PATHS.LOGIN} style={{ fontSize: '14px', color: '#3D5FA8' }}>
                    Voltar ao início
                </a>
            </div>
        ),
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}