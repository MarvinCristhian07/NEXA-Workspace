import { useState, useCallback } from 'react';
import { authService, type RegisterPayload } from '../services/authService';

// Validação de CNPJ algoritmica completa
function validateCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calc = (base: number[], weights: number[]) => {
    const sum = base.reduce((acc, d, i) => acc + d * weights[i], 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const d = digits.split('').map(Number);
  const d1 = calc(d.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]);
  const d2 = calc(d.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]);
  return d1 === d[12] && d2 === d[13];
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: 'weak' | 'medium' | 'strong';
} {
  let score = 0;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Senha fraca', color: 'weak' };
  if (score <= 2) return { score, label: 'Senha razoável', color: 'medium' };
  return { score, label: 'Senha forte', color: 'strong' };
}

// Máscara de CNPJ
function maskCNPJ(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export type Step = 1 | 2 | 3;

interface FormData {
  organizationName: string;
  cnpj: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  organizationName?: string;
  cnpj?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  api?: string;
}

export function useRegisterForm() {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdEmail, setCreatedEmail] = useState('');

  const [data, setData] = useState<FormData>({
    organizationName: '',
    cnpj: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  const update = useCallback((field: keyof FormData, value: string | boolean) => {
    setData((prev) => ({
      ...prev,
      [field]: field === 'cnpj' ? maskCNPJ(value as string) : value,
    }));
    // Limpa erro ao digitar
    setErrors((prev) => ({ ...prev, [field]: undefined, api: undefined }));
  }, []);

  const touch = useCallback((field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Validação por step
  const validateStep1 = (): FormErrors => {
    const e: FormErrors = {};
    if (!data.organizationName.trim() || data.organizationName.trim().length < 2)
      e.organizationName = 'Nome da empresa deve ter ao menos 2 caracteres.';
    if (!validateCNPJ(data.cnpj))
      e.cnpj = 'CNPJ inválido. Verifique os dígitos.';
    return e;
  };

  const validateStep2 = (): FormErrors => {
    const e: FormErrors = {};
    if (!validateEmail(data.email))
      e.email = 'Informe um e-mail corporativo válido.';
    const strength = getPasswordStrength(data.password);
    if (data.password.length < 12)
      e.password = 'A senha deve ter no mínimo 12 caracteres.';
    else if (strength.score < 2)
      e.password = 'Escolha uma senha mais forte.';
    if (data.password !== data.confirmPassword)
      e.confirmPassword = 'As senhas não coincidem.';
    if (!data.acceptTerms)
      e.acceptTerms = 'Você precisa aceitar os Termos de Uso.';
    return e;
  };

  const goNext = useCallback((): boolean => {
    const errs = step === 1 ? validateStep1() : validateStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Marca todos os campos como tocados
      const fields = step === 1
        ? ['organizationName', 'cnpj']
        : ['email', 'password', 'confirmPassword', 'acceptTerms'];
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(fields.map((f) => [f, true])),
      }));
      return false;
    }
    setStep((s) => (s + 1) as Step);
    return true;
  }, [step, data]);

  const goBack = useCallback(() => {
    setStep((s) => (s - 1) as Step);
    setErrors({});
  }, []);

  const submit = useCallback(async () => {
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setErrors({});

    const payload: RegisterPayload = {
      organizationName: data.organizationName.trim(),
      cnpj: data.cnpj,
      email: data.email.toLowerCase().trim(),
      password: data.password,
    };

    try {
      await authService.register(payload);
      setCreatedEmail(payload.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      if (apiErr.code === 'DUPLICATE_CNPJ') {
        setStep(1);
        setErrors({ cnpj: apiErr.message });
      } else if (apiErr.code === 'DUPLICATE_EMAIL') {
        setErrors({ email: apiErr.message });
      } else {
        setErrors({ api: 'Ocorreu um erro inesperado. Tente novamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const passwordStrength = getPasswordStrength(data.password);

  return {
    step, data, errors, touched, isLoading, isSuccess, createdEmail,
    passwordStrength, update, touch, goNext, goBack, submit,
  };
}