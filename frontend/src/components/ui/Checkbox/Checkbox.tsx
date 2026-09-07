import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  errorMessage?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, errorMessage, indeterminate, disabled, className, ...props }, ref) => {
    const hasError = !!errorMessage;
    const isChecked = props.checked;

    const boxClasses = [
      styles.box,
      isChecked || indeterminate ? styles.checked : '',
      indeterminate ? styles.indeterminate : '',
      disabled ? styles.disabled : '',
      hasError ? styles.error : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`${styles.wrapper} ${className ?? ''}`}>
        <label className={`${styles.row} ${disabled ? styles.disabled : ''}`}>
          {/* Input real (acessível, mas visualmente oculto) */}
          <input
            type="checkbox"
            ref={ref}
            disabled={disabled}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            aria-invalid={hasError}
            {...props}
          />

          {/* Caixa visual customizada */}
          <span className={boxClasses} aria-hidden="true">
            {isChecked && !indeterminate && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {indeterminate && (
              <svg width="9" height="2" viewBox="0 0 10 2" fill="white">
                <rect width="10" height="2" rx="1" />
              </svg>
            )}
          </span>

          {label && (
            <span
              className={`${styles['label-text']} ${disabled ? styles.disabled : ''} ${hasError ? styles.error : ''}`}
            >
              {label}
            </span>
          )}
        </label>

        {hasError && (
          <span className={styles['error-msg']} role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';