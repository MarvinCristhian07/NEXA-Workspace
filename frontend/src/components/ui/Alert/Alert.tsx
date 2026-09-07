import { useState, useEffect, useRef, type ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertVariant = 'success' | 'info' | 'warning' | 'danger';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  autoDismiss?: number; // ms
  onDismiss?: () => void;
  icon?: ReactNode;
}

const defaultIcons: Record<AlertVariant, ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  danger: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
};

export function Alert({
  variant = 'info',
  title,
  message,
  dismissible = false,
  autoDismiss,
  onDismiss,
  icon,
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoDismiss && autoDismiss > 0) {
      timerRef.current = window.setTimeout(() => { // Usar window.setTimeout reforça a tipagem do DOM
        setVisible(false);
        onDismiss?.();
      }, autoDismiss);
    }
    
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoDismiss, onDismiss]);
  
  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div
      className={`${styles.alert} ${styles[variant]}`}
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'}
      aria-live={variant === 'danger' ? 'assertive' : 'polite'}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon ?? defaultIcons[variant]}
      </span>

      <div className={styles.content}>
        {title && <strong className={styles.title}>{title}</strong>}
        <span className={styles.message}>{message}</span>
      </div>

      {dismissible && (
        <button
          className={styles.close}
          onClick={handleDismiss}
          aria-label="Fechar alerta"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {autoDismiss && (
        <div
          className={styles.progress}
          style={{ animationDuration: `${autoDismiss}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}