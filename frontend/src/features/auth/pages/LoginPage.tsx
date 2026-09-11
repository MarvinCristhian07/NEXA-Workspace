import React, { useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { Button, Input, Alert, Checkbox } from '../../../components/ui';
import { useLoginForm } from '../hooks/useLoginForm';
import { PATHS } from '../../../router/paths';
import styles from './LoginPage.module.css'

// Ícones SVG inline
const IconMail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconArrowRight = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconShield = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data, errors, touched, isLoading, update, touch, submit } = useLoginForm();

    // Rota de origem (para redirecionar após login)
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? PATHS.DASHBOARD;

    const pageRef   = useRef<HTMLDivElement>(null);
    const cardRef   = useRef<HTMLDivElement>(null);
    const formRef   = useRef<HTMLFormElement>(null);

    // Animação de entrada
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.from(cardRef.current, {
                y: 28,
                opacity: 0,
                duration: 0.65,
                ease: 'power3.out',
            })
            .from(
                ['.login-logo', '.login-heading', '.login-sub'],
                {
                    y: 12,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.07,
                    ease: 'power2.out',
                },
                '-=0.4'
            )
            .from(
                '.login-field',
                {
                    y: 10,
                    opacity: 0,
                    duration: 0.35,
                    stagger: 0.08,
                    ease: 'power2.out',
                },
                '-=0.25'
            );

            // Orbs
            gsap.from(['.orb1', '.orb2', '.orb3'], {
                scale: 0.5,
                opacity: 0,
                duration: 1.4,
                stagger: 0.18,
                ease: 'power2.out',
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    // Shake no erro
    const shakeCard = useCallback(() => {
        gsap.to(cardRef.current, {
            keyframes: {
                x: [-7, 7,-5, 5, -2, 2, 0],
            },
            duration: 0.45,
            ease: 'none',
        });
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        const result = await submit();

        if (!result) {
            shakeCard();
            return;
        }

        if (result.redirectTo === 'mfa') {
            navigate(PATHS.MFA, { replace: true });
        } else {
            navigate(from, { replace: true });
        }
    }, [submit, navigate, from, shakeCard]);

    // Enter para submeter
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    }, [handleSubmit]);

    return (
        <div className={styles.page} ref={pageRef}>
            <BackgroundOrbs />

            <div className={styles.card} ref={cardRef}>

                {/* Logo e cabeçalho */}
                <div className={`${styles.header} login-logo`}>
                    <div className={styles['logo-mark']} aria-label="NEXA Workspace">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#19C4E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                        </svg>
                    </div>
                    <span className={styles['logo-text']}>NEXA</span>
                </div>

                <div className={`${styles.heading} login-heading`}>
                    <h1 className={styles.title}>Bem-vindo de volta!</h1>
                </div>
                <p className={`${styles.subtitle} login-sub`}>
                    Acesso corporativo
                </p>

                {/* Alerta de erro global da API */}
                {errors.api && (
                    <div className="login-field">
                        <Alert
                            variant="danger"
                            message={errors.api}
                            dismissible
                        />
                    </div>
                )}

                {/* Formulário */}
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    onKeyDown={handleKeyDown}
                    noValidate
                    className={styles.form}
                >
                    <div className="login-field">
                        <Input
                            label="E-mail"
                            type="email"
                            placeholder="voce@empresa.com"
                            value={data.email}
                            onChange={(e) => update('email', e.target.value)}
                            onBlur={() => touch('email')}
                            state={
                                touched.email
                                    ? errors.email ? 'error' : data.email ? 'success' : 'default'
                                    : 'default'
                            }
                            errorMessage={touched.email ? errors.email : undefined}
                            leftIcon={<IconMail />}
                            autoComplete="email"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="login-field">
                        <Input
                            label="Senha"
                            showPasswordToggle
                            placeholder="Sua senha"
                            value={data.password}
                            onChange={(e) => update('password', e.target.value)}
                            onBlur={() => touch('password')}
                            state={
                                touched.password
                                    ? errors.password ? 'error' : data.password ? 'success' : 'default'
                                    : 'default'
                            }
                            errorMessage={touched.password ? errors.password : undefined}
                            leftIcon={<IconLock />}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {/* Lembrar + Esqueci */}
                    <div className={`${styles.row} login-field`}>
                        <Checkbox
                            label="Manter conectado"
                            checked={data.rememberMe}
                            onChange={(e) => update('rememberMe', e.target.checked)}
                        />
                        <Link to="#" className={styles['forgot-link']}>
                            Esqueci minha senha
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="login-field">
                        <Button
                            variant="primary"
                            size="lg"
                            full
                            type="submit"
                            loading={isLoading}
                            rightIcon={!isLoading ? <IconArrowRight /> : undefined}
                        >
                            Entrar
                        </Button>
                    </div>
                </form>

                {/* Credenciais de teste */}
                <div className={`${styles['demo-hint']} login-field`}>
                    <span className={styles['demo-label']}>Testar agora</span>
                    <button
                        type="button"
                        className={styles['demo-btn']}
                        onClick={() => {
                            update('email', 'admin@acme.com');
                            update('password', 'SecureP@ss2024!');
                        }}
                    >
                        Admin (com MFA)
                    </button>
                    <span className={styles['demo-sep']}>·</span>
                    <button
                        type="button"
                        className={styles['demo-btn']}
                        onClick={() => {
                            update('email', 'member@acme.com');
                            update('password', 'SecureP@ss2024!');
                        }}
                    >
                        Member (sem MFA)
                    </button>
                </div>

                {/* Segurança */}
                <div className={`${styles['security-badge']} login-field`} aria-label="Conexão segura">
                    <IconShield />
                    <span>Conexão criptografada com TLS 1.3</span>
                </div>

                {/* Cadastro */}
                <p className={styles.footer}>
                    Ainda não tem uma conta?{' '}
                    <Link to={PATHS.REGISTER} className={styles.link}>
                        Cadastre sua empresa
                    </Link>
                </p>
            </div>
        </div>
    );
}