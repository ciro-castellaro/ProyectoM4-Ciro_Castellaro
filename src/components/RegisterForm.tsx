import { useState, type SubmitEvent } from "react";
import { validateEmail, validatePassword } from "../features/auth/validateAuth";

interface RegisterFormProps {
  onSubmit: (values: { email: string; password: string }) => void;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);

    const nextErrors: FormErrors = {
      email: emailResult.ok ? undefined : emailResult.error,
      password: passwordResult.ok ? undefined : passwordResult.error,
    };
    setErrors(nextErrors);

    if (emailResult.ok && passwordResult.ok) {
      onSubmit({ email: emailResult.value, password: passwordResult.value });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 6 caracteres"
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

      <button type="submit" className="primary">
        Crear cuenta
      </button>
    </form>
  );
}

export default RegisterForm;
