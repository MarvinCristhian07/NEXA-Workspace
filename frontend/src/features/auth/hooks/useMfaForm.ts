import React, { useState, useRef, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../store/authStore';

const CODE_LENGTH = 6;

interface UseMfaFormReturn {
    digits: string[];
    inputRefs: React.RefObject<HTMLInputElement>[];
    isLoading: boolean;
    isError: boolean;
    errorMessage: string;
    isComplete: boolean;
    timeLeft: number;
    isExpired: boolean;
    handleInput: (index: number, value: string) => void;
    handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    handlePaste: (e: React.ClipboardEvent) => void;
    handleFocus: (index: number) => void;
    submit: () => Promise<{ success: boolean }>;
    resetCode: () => void;
    resetTimer: () => void;
}

export function useMfaForm(): UseMfaFormReturn {
    const { mfaToken, setAuth } = useAuthStore();

    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [isExpired, setIsExpired] = useState(false);

    // Cria refs para cada input
    const inputRefs = useRef(
        Array.from({ length: CODE_LENGTH }, () => React.createRef<HTMLInputElement>())
    );


    const isComplete = digits.every((d) => d !== '') && digits.length === CODE_LENGTH;

    // Timer regressivo (simula expiração do código TOTP)
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const resetTimer = useCallback(() => {
        setTimeLeft(30);
        setIsExpired(false);
        setIsError(false);
        setErrorMessage('');
    }, []);

    const resetCode = useCallback(() => {
        setDigits(Array(CODE_LENGTH).fill(''));
        setIsError(false);
        setErrorMessage('');
        // Foca no primeiro input
        setTimeout(() => inputRefs.current[0]?.current?.focus(), 50);
    }, []);

    const focusInput = useCallback((index: number) => {
        const clamped = Math.max(0, Math.min(CODE_LENGTH - 1, index));
        inputRefs.current[clamped]?.current?.focus();
    }, []);

    const handleInput = useCallback((index: number, value: string) => {
        // Aceita apenas números
        const digit = value.replace(/\D/g, '').slice(-1);

        setDigits((prev) => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });

        setIsError(false);
        setErrorMessage('');

        // Avança automaticamente ao digitar
        if (digit && index < CODE_LENGTH - 1) {
            focusInput(index + 1);
        }
    }, [focusInput]);

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                if (digits[index]) {
                    // Limpa o atual
                    setDigits((prev) => {
                        const next = [...prev];
                        next[index] = '';
                        return next;
                    });
                } else {
                    // Volta ao anterior e limpa
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        setDigits((prev) => {
                            const next = [...prev];
                            next[prevIndex] = '';
                            return next;
                        });
                        focusInput(prevIndex);
                    }
                }
            }

            if (e.key === 'ArrowLeft') focusInput(index - 1);
            if (e.key === 'ArrowRight') focusInput(index + 1);

            // Enter submete se completo
            if (e.key === 'Enter' && isComplete) {
                submit();
            }
        },
        [digits, focusInput, isComplete]
    );

    // Colar código completo de uma vez
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
        if (!pasted) return;

        const next = Array(CODE_LENGTH).fill('');
        pasted.split('').forEach((char, i) => { next[i] = char; });
        setDigits(next);
        setIsError(false);

        // Foca no último preenchido ou no final
        const lastFilled = Math.min(pasted.length, CODE_LENGTH - 1);
        focusInput(lastFilled);
    }, [focusInput]);

    const handleFocus = useCallback((index: number) => {
        // Seleciona o conteúdo ao focar
        inputRefs.current[index]?.current?.select();
    }, []);

    const submit = useCallback(async () => {
        if (!isComplete || isLoading) return { success: false };

        setIsLoading(true);
        setIsError(false);
        setErrorMessage('');

        try {
            const res = await authService.validateMfa({
                mfaToken: mfaToken ?? '',
                token: digits.join(''),
            });

            setAuth(res.user, res.accessToken);
            return { success: true };
        } catch (err: unknown) {
            const apiErr = err as { message?: string };
            setIsError(true);
            setErrorMessage(apiErr.message ?? 'Código inválido. Tente novamente.');
            resetCode();
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    }, [isComplete, isLoading, digits, mfaToken, setAuth, resetCode]);

    return {
        digits,
        inputRefs: inputRefs.current as React.RefObject<HTMLInputElement>[],
        isLoading,
        isError,
        errorMessage,
        isComplete,
        timeLeft,
        isExpired,
        handleInput,
        handleKeyDown,
        handlePaste,
        handleFocus,
        submit,
        resetCode,
        resetTimer,
    };
}