import { useState, useCallback } from 'react';
import { authService, type LoginPayload } from '../services/authService';
import { useAuthStore } from '../../../store/authStore';

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

interface FormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface FormErrors {
    email?: string;
    password?: string;
    api?: string;
}

interface UseLoginFormReturn {
    data: FormData;
    errors: FormErrors;
    touched: Partial<Record<keyof FormData, boolean>>;
    isLoading: boolean;
    update: (field: keyof FormData, value: string | boolean) => void;
    touch: (field: keyof FormData) => void;
    submit: () => Promise<{ redirectTo: 'mfa' | 'dashboard' } | null>;
}

export function useLoginForm(): UseLoginFormReturn {
    const { setAuth, setMfaPending } = useAuthStore();

    const [data, setData] = useState<FormData>({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
    const [isLoading, setIsLoading] = useState(false);

    const update = useCallback((field: keyof FormData, value: string | boolean) => {
        setData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined, api: undefined }));
    }, []);

    const touch = useCallback((field: keyof FormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    const validate = (): FormErrors => {
        const e: FormErrors = {};
        if (!data.email.trim()) {
            e.email = 'Informe seu e-mail.';
        } else if (!validateEmail(data.email)) {
            e.email = 'Informe um e-mail válido.';
        }
        if (!data.password) {
            e.password = 'Informe sua senha.';
        }
        return e;
    };

    const submit = useCallback(async () => {
        // Marca todos como tocados
        setTouched({ email: true, password: true });

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return null;
        }

        setIsLoading(true);
        setErrors({});

        const payload: LoginPayload = {
            email: data.email.trim().toLowerCase(),
            password: data.password,
        };

        try {
            const res = await authService.login(payload);

            if (res.mfaRequired && res.mfaToken) {
                // Armazena mfaToken temporário no store (sessionStorage)
                setMfaPending(res.mfaToken);
                return { redirectTo: 'mfa' as const };
            }

            if (res.accessToken && res.user) {
                // Armazena token e dados do usuário
                setAuth(res.user, res.accessToken);
                return { redirectTo: 'dashboard' as const };
            }

            return null;
        } catch (err: unknown) {
            const apiErr = err as { code?: string; message?: string };
            setErrors({
                api: apiErr.message ?? 'Ocorreu um erro inesperado. Tente novamente.',
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [data, setAuth, setMfaPending]);

    return { data, errors, touched, isLoading, update, touch, submit };
}