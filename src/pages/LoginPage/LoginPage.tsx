import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../../components/LoginForm/LoginForm";
import { loginWithEmail } from "../../services/firebase/auth";
import "./LoginPage.css";

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
      <div className="auth-content">
        <div className="auth-mobile-brand">
          <span className="auth-mobile-brand-name">MateCode</span>
          <p className="auth-mobile-brand-tagline">
            Tus tareas, en un solo lugar.
          </p>
        </div>

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

      <div className="auth-panel">
        <div className="auth-panel-content">
          <span className="auth-panel-brand">MateCode</span>
          <h2 className="auth-panel-headline">
            Tus tareas,
            <br />
            <span className="auth-panel-accent">en un solo lugar.</span>
          </h2>
          <p className="auth-panel-description">
            Organizá proyectos, completá tareas y mantené el foco sin
            distracciones.
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
