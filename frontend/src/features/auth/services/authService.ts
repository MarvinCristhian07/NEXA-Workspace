/**
 * Auth Service - Mock da API
 * Simula chamadas reais com delay realista
 */

export interface RegisterPayload {
    organizationName: string;
    cnpj: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    organization: { id: string; name: string; document: string };
    user: { id: string; email: string };
}

// Simular CNPJs já cadastrados
const TAKEN_CNPJS = ['11.222.333/0001-81'];
const TAKEN_EMAILS = ['admin@nexa.com', 'teste@nexa.com'];

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    mfaRequired: boolean;
    // Sem MFA
    accessToken?: string;
    expiresIn?: string;
    user?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'MEMBER' | 'GUEST';
        mfaEnabled: boolean;
        organizationId: string;
    };
    // Com MFA
    mfaToken?: string;
}

// Usuários mock para simular login
const MOCK_USERS = [
    {
        email: 'admin@acme.com',
        password: 'SecureP@ss2024!',
        mfaEnabled: true,
        id: '660e8400-e29b-41d4-a716-446655440001',
        role: 'ADMIN' as const,
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
    },
    {
        email: 'member@acme.com',
        password: 'SecureP@ss2024!',
        mfaEnabled: false,
        id: '770e8400-e29b-41d4-a716-446655440002',
        role: 'MEMBER' as const,
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
    },
];

export interface MfaValidatePayload {
    mfaToken: string;
    token: string;
}

export interface MfaValidateResponse {
    accessToken: string;
    expiresIn: string;
    user: {
        id: string;
        email: string;
        role: 'ADMIN' | 'MEMBER' | 'GUEST';
        mfaEnabled: boolean;
        organizationId: string;
    };
}

export const authService = {
    async register(payload: RegisterPayload): Promise<RegisterResponse> {
        await delay(1800); // Simular latência realista

        if (TAKEN_CNPJS.includes(payload.cnpj)) {
            throw { code: 'DUPLICATE_CNPJ', message: 'CNPJ já cadastrado no sistema.' };
        }

        if (TAKEN_EMAILS.includes(payload.email.toLocaleLowerCase())) {
            throw { code: 'DUPLICATE_EMAIL', message: 'Este e-mail já está em uso.' };
        }

        return {
            organization: {
                id: crypto.randomUUID(),
                name: payload.organizationName,
                document: payload.cnpj,
            },
            user: {
                id: crypto.randomUUID(),
                email: payload.email,
            },
        };
    },

    async login(payload: LoginPayload): Promise<LoginResponse> {
        await delay(1400);

        const user = MOCK_USERS.find(
            (u) =>
                u.email.toLowerCase() === payload.email.toLowerCase() &&
                u.password === payload.password
        );

        // Sempre mesma mensagem - não revela se email existe (anti-enumeração)
        if (!user) {
            throw { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha incorretos.' };
        }

        if (user.mfaEnabled) {
            return {
                mfaRequired: true,
                mfaToken: `mfa_temp_${crypto.randomUUID()}`,
            };
        }

        return {
            mfaRequired: false,
            accessToken: `access_${crypto.randomUUID()}`,
            expiresIn: '24h',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                mfaEnabled: user.mfaEnabled,
                organizationId: user.organizationId,
            },
        };
    },

    async validateMfa(payload: MfaValidatePayload): Promise<MfaValidateResponse> {
        await delay(1200);

        // Código válido para testes: 482910
        // Qualquer outro → erro
        if (payload.token !== '482910') {
            throw { code: 'MFA_TOKEN_INVALID', message: 'Código inválido ou expirado.' };
        }

        return {
            accessToken: `access_${crypto.randomUUID()}`,
            expiresIn: '24h',
            user: {
                id: '660e8400-e29b-41d4-a716-446655440001',
                email: 'admin@acme.com',
                role: 'ADMIN',
                mfaEnabled: true,
                organizationId: '550e8400-e29b-41d4-a716-446655440000',
            },
        };
    },
};