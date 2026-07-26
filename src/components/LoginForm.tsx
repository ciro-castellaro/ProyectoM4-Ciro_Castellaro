import { useState, type SubmitEvent } from "react";
import {
  validateEmail,
  validateLoginPassword,
} from "../features/auth/validateAuth";
import type { Result } from "../types/result";

interface LoginFormProps {
  onSubmit: (values: {
    email: string;
    password: string;
  }) => Promise<Result<unknown>>;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailResult = validateEmail(email);
    const passwordResult = validateLoginPassword(password);

    setErrors({
      email: emailResult.ok ? undefined : emailResult.error,
      password: passwordResult.ok ? undefined : passwordResult.error,
    });
    setSubmitError(null);

    if (!emailResult.ok || !passwordResult.ok) {
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit({
      email: emailResult.value,
      password: passwordResult.value,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
        />
        {errors.email && (
          <p id="login-email-error" className="field-error" role="alert">
            ⚠ {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contraseña"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
        />
        {errors.password && (
          <p id="login-password-error" className="field-error" role="alert">
            ⚠ {errors.password}
          </p>
        )}
      </div>

      {submitError && (
        <p className="field-error" role="alert">
          ⚠ {submitError}
        </p>
      )}

      <button type="submit" className="primary" disabled={isSubmitting}>
        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );
}

export default LoginForm;
