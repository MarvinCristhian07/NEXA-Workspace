import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button, Alert } from '../../../components/ui';
import { useMfaForm } from '../hooks/useMfaForm';
import { useAuthStore } from '../../../store/authStore';
import { PATHS } from '../../../router/paths';
import styles from './MfaPage.module.css';

// SVG Icons
const IconShieldCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

function BackgroundOrbs() {
  return (
    <div className={styles.orbs} aria-hidden="true">
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
    </div>
  );
}

// Timer circular SVG
function TimerRing({ timeLeft, total = 30 }: { timeLeft: number; total?: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const offset = circumference * (1 - progress);
  const isUrgent = timeLeft <= 8;

  return (
    <div className={styles['timer-wrap']} aria-label={`${timeLeft} segundos restantes`}>
      <svg width="56" height="56" viewBox="0 0 56 56" className={styles['timer-svg']}>
        {/* Track */}
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="3"
        />
        {/* Progress */}
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={isUrgent ? 'var(--color-danger)' : 'var(--color-primary)'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <span
        className={styles['timer-text']}
        style={{ color: isUrgent ? 'var(--color-danger)' : 'var(--color-primary)' }}
      >
        {timeLeft}s
      </span>
    </div>
  );
}

export function MfaPage() {
  const navigate = useNavigate();
  const { mfaToken, isMfaPending, clearAuth } = useAuthStore();

  const {
    digits, inputRefs, isLoading, isError, errorMessage,
    isComplete, timeLeft, isExpired,
    handleInput, handleKeyDown, handlePaste, handleFocus,
    submit, resetCode, resetTimer,
  } = useMfaForm();

  const pageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const digitsRef = useRef<HTMLDivElement>(null);

  // Redireciona se não há mfaToken pendente
  useEffect(() => {
    if (!isMfaPending && !mfaToken) {
      navigate(PATHS.LOGIN, { replace: true });
    }
  }, [isMfaPending, mfaToken, navigate]);

  // Animação de entrada
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(cardRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
      .from('.mfa-icon', {
        scale: 0.7,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.8)',
      }, '-=0.3')
      .from('.mfa-heading', {
        y: 10,
        opacity: 0,
        duration: 0.35,
        stagger: 0.07,
        ease: 'power2.out',
      }, '-=0.2')
      .from('.mfa-digit-box', {
        y: 14,
        opacity: 0,
        scale: 0.85,
        duration: 0.35,
        stagger: 0.05,
        ease: 'back.out(1.5)',
      }, '-=0.1');

      gsap.from(['.mfa-orb1', '.mfa-orb2', '.mfa-orb3'], {
        scale: 0.4,
        opacity: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: 'power2.out',
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Animação de shake no erro
  const shakeDigits = useCallback(() => {
    gsap.to(digitsRef.current, {
      keyframes: { x: [-8, 8, -6, 6, -3, 3, 0] },
      duration: 0.45,
      ease: 'none',
    });
  }, []);

  // Animação de sucesso
  const animateSuccess = useCallback(() => {
    return new Promise<void>((resolve) => {
      gsap.to(cardRef.current, {
        scale: 1.02,
        duration: 0.15,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onComplete: resolve,
      });
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const result = await submit();
    if (result.success) {
      await animateSuccess();
      navigate(PATHS.DASHBOARD, { replace: true });
    } else {
      shakeDigits();
    }
  }, [submit, navigate, animateSuccess, shakeDigits]);

  const handleBack = useCallback(() => {
    clearAuth();
    navigate(PATHS.LOGIN, { replace: true });
  }, [clearAuth, navigate]);

  const handleResend = useCallback(() => {
    resetCode();
    resetTimer();
  }, [resetCode, resetTimer]);

  // Auto-submit quando completo
  useEffect(() => {
    if (isComplete && !isExpired && !isLoading) {
      const timeout = setTimeout(() => handleSubmit(), 300);
      return () => clearTimeout(timeout);
    }
  }, [isComplete, isExpired, isLoading, handleSubmit]);

  return (
    <div className={styles.page} ref={pageRef}>
      <BackgroundOrbs />

      <div className={styles.card} ref={cardRef}>

        {/* Voltar */}
        <button className={styles['back-btn']} onClick={handleBack} aria-label="Voltar ao login">
          <IconArrowLeft />
          Voltar
        </button>

        {/* Ícone central */}
        <div className={`${styles['icon-wrap']} mfa-icon`} aria-hidden="true">
          <div className={styles['icon-inner']}>
            <IconShieldCheck />
          </div>
          <div className={styles['icon-ring']} />
        </div>

        {/* Heading */}
        <h1 className={`${styles.title} mfa-heading`}>
          Verificação em 2 fatores
        </h1>
        <p className={`${styles.subtitle} mfa-heading`}>
          Digite o código de{' '}
          <strong className={styles['code-highlight']}>6 dígitos</strong>{' '}
          do seu app autenticador
        </p>

        {/* Conta */}
        <div className={`${styles['account-pill']} mfa-heading`}>
          <span className={styles['account-dot']} aria-hidden="true" />
          <span className={styles['account-email']}>admin@acme.com</span>
        </div>

        {/* Erros */}
        {isError && errorMessage && (
          <Alert
            variant="danger"
            message={errorMessage}
            dismissible
          />
        )}

        {isExpired && (
          <Alert
            variant="warning"
            title="Código expirado"
            message="Solicite um novo código para continuar."
            dismissible={false}
          />
        )}

        {/* Dica do código de teste */}
        <div className={styles['test-hint']}>
          <span>Código para teste:</span>
          <button
            className={styles['test-code-btn']}
            onClick={() => {
              const code = '482910';
              const syntheticPaste = new ClipboardEvent('paste', {
                clipboardData: new DataTransfer(),
              });
              (syntheticPaste.clipboardData as DataTransfer).setData('text', code);
              handlePaste(syntheticPaste as unknown as React.ClipboardEvent);
            }}
          >
            482910
          </button>
        </div>

        {/* Inputs de dígitos */}
        <div
          ref={digitsRef}
          className={styles['digits-row']}
          onPaste={handlePaste}
          role="group"
          aria-label="Código de 6 dígitos"
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i] as React.RefObject<HTMLInputElement>}
              className={`${styles['digit-input']} mfa-digit-box ${
                digit ? styles['digit-filled'] : ''
              } ${isError ? styles['digit-error'] : ''} ${
                isExpired ? styles['digit-expired'] : ''
              }`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={() => handleFocus(i)}
              aria-label={`Dígito ${i + 1} de 6`}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              disabled={isExpired || isLoading}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Timer + reenviar */}
        <div className={styles['timer-row']}>
          <TimerRing timeLeft={timeLeft} />
          <div className={styles['timer-info']}>
            <span className={styles['timer-label']}>
              {isExpired ? 'Código expirado' : 'Código expira em'}
            </span>
            <button
              className={styles['resend-btn']}
              onClick={handleResend}
              type="button"
            >
              <IconRefresh />
              Solicitar novo código
            </button>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          full
          loading={isLoading}
          disabled={!isComplete || isExpired}
          rightIcon={!isLoading ? <IconArrowRight /> : undefined}
          onClick={handleSubmit}
        >
          {isLoading ? 'Verificando…' : 'Verificar código'}
        </Button>

        {/* Backup code */}
        <div className={styles['backup-row']}>
          <span className={styles['backup-text']}>
            Perdeu o acesso ao app?
          </span>
          <button className={styles['backup-link']} type="button">
            Usar código de backup
          </button>
        </div>

        {/* Apps suportados */}
        <div className={styles['apps-row']}>
          {['Google Authenticator', 'Microsoft Authenticator', 'Authy'].map((app) => (
            <span key={app} className={styles['app-tag']}>{app}</span>
          ))}
        </div>
      </div>
    </div>
  );
}