import { useState } from "react";
import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

function LoginPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  function handleSubmit(values: { email: string; password: string }) {
    setSubmittedEmail(values.email);
  }

  return (
    <main className="auth-layout">
      <div className="auth-panel" aria-hidden="true" />

      <div className="auth-content">
        <div className="card auth-card">
          <h1>Iniciar sesión</h1>
          <p className="auth-subtitle">
            Ingresá a tu cuenta para ver tus tareas.
          </p>

          <LoginForm onSubmit={handleSubmit} />

          {submittedEmail && (
            <p role="status">
              ✓ Formulario válido para {submittedEmail}. La conexión con
              Firebase se agrega en la próxima etapa.
            </p>
          )}

          <p className="auth-switch">
            ¿No tenés cuenta? <Link to="/register">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
