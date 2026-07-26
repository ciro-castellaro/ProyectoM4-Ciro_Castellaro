import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/firebase/auth";

function AppHeader() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
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
    <header className="app-header">
      <div className="app-header-content">
        <span className="app-header-brand">MateCode</span>
        <div className="app-header-actions">
          {user?.email && (
            <span className="app-header-user">{user.email}</span>
          )}
          <button type="button" className="secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
      {logoutError && (
        <p className="field-error" role="alert">
          ⚠ {logoutError}
        </p>
      )}
    </header>
  );
}

export default AppHeader;
