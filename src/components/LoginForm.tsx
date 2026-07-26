import { useState, type SubmitEvent } from "react";
import {
  validateEmail,
  validateLoginPassword,
} from "../features/auth/validateAuth";

interface LoginFormProps {
  onSubmit: (values: { email: string; password: string }) => void;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailResult = validateEmail(email);
    const passwordResult = validateLoginPassword(password);

    setErrors({
      email: emailResult.ok ? undefined : emailResult.error,
      password: passwordResult.ok ? undefined : passwordResult.error,
    });

    if (emailResult.ok && passwordResult.ok) {
      onSubmit({ email: emailResult.value, password: passwordResult.value });
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

      <button type="submit" className="primary">
        Iniciar sesión
      </button>
    </form>
  );
}

export default LoginForm;
