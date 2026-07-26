import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../../components/RegisterForm/RegisterForm";
import { registerWithEmail } from "../../services/firebase/auth";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  async function handleSubmit(values: { email: string; password: string }) {
    const result = await registerWithEmail(values.email, values.password);

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
          <h1>Crear cuenta</h1>
          <p className="auth-subtitle">
            Registrate para empezar a organizar tus tareas.
          </p>

          <RegisterForm onSubmit={handleSubmit} />

          <p className="auth-switch">
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
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

export default RegisterPage;
