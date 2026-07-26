import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { loginWithEmail } from "../services/firebase/auth";

function LoginPage() {
  const navigate = useNavigate();

  async function handleSubmit(values: { email: string; password: string }) {
    const result = await loginWithEmail(values.email, values.password);

    if (result.ok) {
      navigate("/tasks", { replace: true });
    }

    return result;
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

          <p className="auth-switch">
            ¿No tenés cuenta? <Link to="/register">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
