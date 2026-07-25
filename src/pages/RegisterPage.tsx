import { useState } from "react";
import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

function RegisterPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  function handleSubmit(values: { email: string; password: string }) {
    setSubmittedEmail(values.email);
  }

  return (
    <main className="auth-layout">
      <div className="auth-panel" aria-hidden="true" />

      <div className="auth-content">
        <div className="card auth-card">
          <h1>Crear cuenta</h1>
          <p className="auth-subtitle">
            Registrate para empezar a organizar tus tareas.
          </p>

          <RegisterForm onSubmit={handleSubmit} />

          {submittedEmail && (
            <p role="status">
              ✓ Formulario válido para {submittedEmail}. La conexión con
              Firebase se agrega en la próxima etapa.
            </p>
          )}

          <p className="auth-switch">
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
