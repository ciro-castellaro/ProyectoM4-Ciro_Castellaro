import { useState, type SubmitEvent } from "react";
import {
  validateEmail,
  validatePassword,
} from "../../features/auth/validateAuth";
import type { Result } from "../../types/result";
import "./RegisterForm.css";

interface RegisterFormProps {
  onSubmit: (values: {
    email: string;
    password: string;
  }) => Promise<Result<unknown>>;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);

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
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
        />
        {errors.email && (
          <p id="register-email-error" className="field-error" role="alert">
            ⚠ {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 6 caracteres"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "register-password-error" : undefined
          }
        />
        {errors.password && (
          <p id="register-password-error" className="field-error" role="alert">
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
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}

export default RegisterForm;
