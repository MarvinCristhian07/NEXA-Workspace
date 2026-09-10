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
};