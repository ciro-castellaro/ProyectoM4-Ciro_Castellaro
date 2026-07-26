import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/firebase/auth";

function TasksPage() {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setLogoutError(null);
    const result = await logout();

    if (result.ok) {
      navigate("/login", { replace: true });
      return;
    }

    setLogoutError(result.error);
  }

  return (
    <main>
      <div className="tasks-header">
        <h1>Mis tareas</h1>
        <button type="button" className="secondary" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {logoutError && (
        <p className="field-error" role="alert">
          ⚠ {logoutError}
        </p>
      )}
    </main>
  );
}

export default TasksPage;
