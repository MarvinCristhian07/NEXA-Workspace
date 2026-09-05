/**
 * Constantes de rotas - fonte única da verdade
 * Nunca usar strings soltas de path no código
 */
export const PATHS = {
    // Auth
    LOGIN: '/login',
    REGISTER: '/cadastro',
    MFA: '/auth/mfa',

    // App
    DASHBOARD: '/dashboard',

    // Futuras (Fase 2)
    PROJECTS: '/dashboard/projetos',
    SETTINGS: '/dashboard/configuracoes',
    PROFILE: '/dashboard/perfil',
} as const;

export type AppPath = typeof PATHS[keyof typeof PATHS];