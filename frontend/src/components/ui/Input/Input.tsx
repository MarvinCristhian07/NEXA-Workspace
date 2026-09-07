import {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import styles from './Input.module.css';

type InputState = 'default' | 'error' | 'success';

interface BaseInputProps {
  label?: string;
  hint?: string;
  errorMessage?: string;
  successMessage?: string;
  state?: InputState;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  required?: boolean;
}

// Input padrão
interface InputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'required'> {
  as?: 'input';
  showPasswordToggle?: boolean;
  showStrength?: boolean;
}

// Textarea
interface TextareaProps
  extends BaseInputProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'> {
  as: 'textarea';
  rows?: number;
}

type Props = InputProps | TextareaProps;

// Avalia força da senha
function getPasswordStrength(value: string): {
  score: number;
  label: string;
  color: 'weak' | 'medium' | 'strong' | '';
} {
  if (!value) return { score: 0, label: '', color: '' };
  let score = 0;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (score <= 1) return { score, label: 'Senha fraca', color: 'weak' };
  if (score <= 2) return { score, label: 'Senha média', color: 'medium' };
  return { score, label: 'Senha forte', color: 'strong' };
}

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  Props
>((props, ref) => {
  const {
    label,
    hint,
    errorMessage,
    successMessage,
    state = 'default',
    leftIcon,
    rightIcon,
    onRightIconClick,
    required,
    className,
    ...rest
  } = props;

  const uid = useId();
  const [showPassword, setShowPassword] = useState(false);

  const isTextarea = props.as === 'textarea';
  const showPasswordToggle =
    !isTextarea && (props as InputProps).showPasswordToggle;
  const showStrength =
    !isTextarea && (props as InputProps).showStrength;
  const inputValue = (rest as InputProps).value as string | undefined;

  const inputStateClass =
    state === 'error'
      ? styles['input-error']
      : state === 'success'
      ? styles['input-success']
      : '';

  const inputClasses = [
    styles.input,
    isTextarea ? styles.textarea : '',
    leftIcon ? styles['has-left'] : '',
    rightIcon || showPasswordToggle ? styles['has-right'] : '',
    inputStateClass,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const strength = showStrength
    ? getPasswordStrength(inputValue ?? '')
    : null;

  const ariaDescribedBy = [
    errorMessage ? `${uid}-error` : '',
    successMessage ? `${uid}-success` : '',
    hint ? `${uid}-hint` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={uid}>
          {label}
          {required && (
            <span className={styles.required} aria-label="obrigatório">
              *
            </span>
          )}
        </label>
      )}

      <div className={styles['input-wrap']}>
        {leftIcon && (
          <span className={styles['icon-left']} aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {isTextarea ? (
          <textarea
            id={uid}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={inputClasses}
            aria-describedby={ariaDescribedBy || undefined}
            aria-invalid={state === 'error'}
            rows={(props as TextareaProps).rows ?? 4}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={uid}
            ref={ref as React.Ref<HTMLInputElement>}
            className={inputClasses}
            type={
              showPasswordToggle
                ? showPassword
                  ? 'text'
                  : 'password'
                : (rest as InputProps).type ?? 'text'
            }
            aria-describedby={ariaDescribedBy || undefined}
            aria-invalid={state === 'error'}
            required={required}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {/* Ícone direito — toggle de senha ou ícone customizado */}
        {showPasswordToggle && (
          <button
            type="button"
            className={`${styles['icon-right']} ${styles.clickable}`}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}

        {rightIcon && !showPasswordToggle && (
          <span
            className={`${styles['icon-right']} ${onRightIconClick ? styles.clickable : ''}`}
            onClick={onRightIconClick}
            aria-hidden={!onRightIconClick}
            role={onRightIconClick ? 'button' : undefined}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {/* Força da senha */}
      {showStrength && strength && strength.score > 0 && (
        <div>
          <div className={styles['strength-bars']}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`${styles['strength-bar']} ${
                  i <= strength.score ? styles[strength.color] : ''
                }`}
              />
            ))}
          </div>
          <span
            className={styles['strength-label']}
            style={{
              color:
                strength.color === 'weak'
                  ? 'var(--color-danger)'
                  : strength.color === 'medium'
                  ? 'var(--color-warning)'
                  : 'var(--color-success)',
            }}
          >
            {strength.label}
          </span>
        </div>
      )}

      {/* Mensagens de feedback */}
      {state === 'error' && errorMessage && (
        <span id={`${uid}-error`} className={styles['error-msg']} role="alert">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {errorMessage}
        </span>
      )}

      {state === 'success' && successMessage && (
        <span id={`${uid}-success`} className={styles['success-msg']}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {successMessage}
        </span>
      )}

      {hint && state === 'default' && (
        <span id={`${uid}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';