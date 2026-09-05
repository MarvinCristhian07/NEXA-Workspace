/**
 * Store de autenticação - Zustand
 * Estado global de auth compartilhado por toda a aplicação
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'MEMBER' | 'GUEST';
    mfaEnabled: boolean;
    organizationId: string;
}

interface AuthState {
    // Estado
    user: User | null;
    accessToken: string | null;
    mfaToken: string | null;
    isAuthenticated: boolean;
    isMfaPending: boolean;

    // Ações
    setAuth: (user: User, accessToken: string) => void;
    setMfaPending: (mfaToken: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            mfaToken: null,
            isAuthenticated: false,
            isMfaPending: false,

            setAuth: (user, accessToken) =>
                set({
                    user,
                    accessToken,
                    isAuthenticated: true,
                    isMfaPending: false,
                    mfaToken: null,
                }),

            setMfaPending: (mfaToken) =>
                set({
                    mfaToken,
                    isMfaPending: true,
                    isAuthenticated: false,
                }),

            clearAuth: () =>
                set({
                    user: null,
                    accessToken: null,
                    mfaToken: null,
                    isAuthenticated: false,
                    isMfaPending: false,
                }),
        }),
        {
            name: 'nexa-auth',
            storage: createJSONStorage(() => sessionStorage),
            // Persiste apenas o token e user - mfaToken nunca persiste
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);