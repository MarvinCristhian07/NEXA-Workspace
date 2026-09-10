import { useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button, Input, Alert, Checkbox } from '../../../components/ui';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { PATHS } from '../../../router/paths';
import styles from './RegisterPage.module.css';

// Ícones inline SVG
const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

// Orbs decorativos do fundo
function BackgroundOrbs() {
  return (
    <div className={styles.orbs} aria-hidden="true">
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
    </div>
  );
}

// Indicador de steps
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Empresa' },
    { n: 2, label: 'Acesso' },
    { n: 3, label: 'Confirmação' },
  ];

  return (
    <div className={styles['step-indicator']} role="list" aria-label="Progresso do cadastro">
      {steps.map((s, i) => (
        <div key={s.n} className={styles['step-item']} role="listitem">
          <div
            className={`${styles['step-dot']} ${
              current > s.n
                ? styles['step-done']
                : current === s.n
                ? styles['step-active']
                : styles['step-idle']  
            }`}
            aria-current={current === s.n ? 'step' : undefined}
          >
            {current > s.n ? <IconCheck /> : s.n}
          </div>
          <span className={`${styles['step-label']} ${current === s.n ? styles['step-label-active'] : ''}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`${styles['step-line']} ${current > s.n ? styles['step-line-done'] : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function RegisterPage() {
    const navigate = useNavigate();
    const {
      step, data, errors, touched, isLoading, isSuccess, createdEmail,
      passwordStrength, update, touch, goNext, goBack, submit,
    } = useRegisterForm();

    // Refs para animações
    const pageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const successRef = useRef<HTMLDivElement>(null);

    // Animação de entrada inicial
    useEffect(() => {
      const ctx = gsap.context(() => {
        gsap.from(cardRef.current, {
          y: 32,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
        });
        gsap.from('.orb', {
          scale: 0.6,
          opacity: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power2.out',
        });
      }, pageRef);

      return () => ctx.revert();
    }, []);

    // Animação de transição entre steps
    const animateStepTransition = useCallback(
      (direction: 'forward' | 'back', callback: () => void) => {
        const el = formRef.current;
        if (!el) { callback(); return; }

        const xOut = direction === 'forward' ? -24 : 24;
        const xIn = direction === 'forward' ? 24 : -24;
 
        gsap.to(el, {
          x: xOut, opacity: 0, duration: 0.2, ease: 'power2.in',
          onComplete: () => {
            callback();
            gsap.fromTo(
              el,
              { x: xIn, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
          },
        });
      },
      []
    );

    // Próximo step com animação
    const handleNext = useCallback(() => {
      const valid = goNext();
      if (!valid) {
        // Shake no card se inválido utilizando keyframes (padrão GSAP 3)
        gsap.to(cardRef.current, {
          keyframes: {
            x: [-6, 6, -4, 4, -2, 2, 0]
          },
          duration: 0.4,
          ease: 'none',
        });
      }
    }, [goNext]);

    const handleBack = useCallback(() => {
      animateStepTransition('back', goBack);
    }, [animateStepTransition, goBack]);

    // Animação de sucesso
    useEffect(() => {
      if (isSuccess && successRef.current) {
        gsap.from(successRef.current, {
          scale: 0.88,
          opacity: 0,
          duration: 0.5,
          ease: 'back.out(1.4)',
        });
        gsap.from('.success-icon', {
          scale: 0,
          duration: 0.4,
          delay: 0.3,
          ease: 'back.out(2)',
        });
      }
    }, [isSuccess]);

    // Tela de sucesso
    if (isSuccess) {
      return (
        <div className={styles.page} ref={pageRef}>
          <BackgroundOrbs />
          <div className={styles.card} ref={successRef}>
            <div className={styles['success-screen']}>
              <div className={`${styles['success-icon-wrap']} success-icon`}>
                <IconCheck />
              </div>
              <h1 className={styles['success-title']}>Conta criada!</h1>
              <p className={styles['success-sub']}>
                Bem-vindo ao NEXA Workspace.<br />
                <strong>{createdEmail}</strong>
              </p>
              <p className={styles['success-body']}>
                Para ativar sua conta com segurança, configure a verificação em dois fatores.
              </p>
              <Button
                variant="primary"
                size="lg"
                full
                rightIcon={<IconArrowRight />}
                onClick={() => navigate(PATHS.MFA)}
              >
                Configurar verificação em 2 etapas
              </Button>
              <button
                className={styles['skip-link']}
                onClick={() => navigate(PATHS.DASHBOARD)}
              >
                Pular etapa
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.page} ref={pageRef}>
        <BackgroundOrbs />

        <div className={styles.card} ref={cardRef}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logo} aria-label="NEXA Workspace">
              <div className={styles['logo-mark']}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#19C4E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                </svg>
              </div>
              <span className={styles['logo-text']}>NEXA</span>
            </div>
            <div className={styles['header-text']}>
              <h1 className={styles.title}>Crie sua conta</h1>
              <p className={styles.subtitle}>Onboarding corporativo · {step} de 2</p>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* Erro de API gllobal */}
          {errors.api && (
            <Alert
              variant="danger"
              message={errors.api}
              dismissible
            />
          )}

          {/* Formulário */}
          <div ref={formRef}>

            {/* STEP 1 - Dados da empresa */}
            {step === 1 && (
              <div className={styles['form-body']}>
                <div className={styles['form-section-label']}>
                  <IconBuilding />
                  Dados da organização
                </div>

                <Input
                  label="Nome da empresa"
                  placeholder="Acme Corporation"
                  value={data.organizationName}
                  onChange={(e) => update('organizationName', e.target.value)}
                  onBlur={() => touch('organizationName')}
                  state={touched.organizationName && errors.organizationName ? 'error' : 'default'}
                  errorMessage={touched.organizationName ? errors.organizationName : undefined}
                  required
                  autoFocus
                />

                <Input
                  label="CNPJ"
                  placeholder="00.000.000/0001-00"
                  value={data.cnpj}
                  onChange={(e) => update('cnpj', e.target.value)}
                  onBlur={() => touch('cnpj')}
                  state={
                    touched.cnpj
                      ? errors.cnpj
                        ? 'error'
                        : data.cnpj.replace(/\D/g, '').length === 14
                        ? 'success'
                        : 'default'
                      : 'default'
                  }
                  errorMessage={touched.cnpj ? errors.cnpj : undefined}
                  successMessage={
                    touched.cnpj && !errors.cnpj && data.cnpj.replace(/\D/g, '').length === 14
                      ? 'CNPJ válido'
                      : undefined
                  }
                  hint="Somente empresas com CNPJ ativo podem se cadastrar."
                  required
                />

                <Button
                  variant="primary"
                  size="lg"
                  full
                  rightIcon={<IconArrowRight />}
                  onClick={handleNext}
                >
                  Continuar
                </Button>
              </div>
            )}

            {/* STEP 2 - Dados de acesso*/}
            {step === 2 && (
              <div className={styles['form-body']}>
                <div className={styles['form-section-label']}>
                  <IconMail />
                  Conta do administrador
                </div>

                <Input
                  label="E-mail corporativo"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={data.email}
                  onChange={(e) => update('email', e.target.value)}
                  onBlur={() => touch('email')}
                  state={touched.email ? (errors.email ? 'error' : data.email ? 'success' : 'default') : 'default'}
                  errorMessage={touched.email ? errors.email : undefined}
                  leftIcon={<IconMail />}
                  required
                  autoFocus
                />

                <div>
                  <Input
                    label="Senha"
                    showPasswordToggle
                    showStrength
                    placeholder="Mínimo 12 caracteres"
                    value={data.password}
                    onChange={(e) => update('password', e.target.value)}
                    onBlur={() => touch('password')}
                    state={touched.password ? (errors.password ? 'error' : data.password.length >= 12 ? 'success' : 'default') : 'default'}
                    errorMessage={touched.password ? errors.password : undefined}
                    leftIcon={<IconLock />}
                    required
                  />
                </div>

                <Input
                  label="Confirmar senha"
                  showPasswordToggle
                  placeholder="Repita a senha"
                  value={data.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  onBlur={() => touch('confirmPassword')}
                  state={
                    touched.confirmPassword
                      ? errors.confirmPassword
                        ? 'error'
                        : data.confirmPassword && data.password === data.confirmPassword
                        ? 'success'
                        : 'default'
                      : 'default'
                  }
                  errorMessage={touched.confirmPassword ? errors.confirmPassword : undefined}
                  successMessage={
                    !errors.confirmPassword && data.confirmPassword && data.password === data.confirmPassword
                      ? 'Senhas coincidem'
                      : undefined
                  }
                  leftIcon={<IconLock />}
                  required
                />

                <Checkbox
                  label={
                    <span>
                      Li e aceito os{' '}
                      <a href="#" className={styles.link}>Termos de Uso</a>
                      {' '}e a{' '}
                      <a href="#" className={styles.link}>Política de Privacidade</a>
                    </span>
                  }
                  checked={data.acceptTerms}
                  onChange={(e) => update('acceptTerms', e.target.checked)}
                  errorMessage={touched.acceptTerms ? errors.acceptTerms : undefined}
                />

                <div className={styles['step2-actions']}>
                  <Button
                    variant="ghost"
                    size="lg"
                    leftIcon={<IconArrowLeft />}
                    onClick={handleBack}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    rightIcon={!isLoading ? <IconArrowRight /> : undefined}
                    onClick={submit}
                    style={{ flex: 1 }}
                  >
                    Criar conta
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className={styles.footer}>
            Já tem uma conta?{' '}
            <Link to={PATHS.LOGIN} className={styles.link}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    );
}