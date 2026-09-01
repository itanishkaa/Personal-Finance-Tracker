import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-teal" : "text-ink-soft hover:text-ink"
  }`;

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-line bg-card">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">FinTrack</h1>
          <p className="text-sm text-ink-soft mt-0.5">
            Your personal ledger, at a glance.
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <NavLink to="/" end className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/analytics" className={navLinkClass}>
                Analytics
              </NavLink>
              <NavLink to="/budgets" className={navLinkClass}>
                Budgets
              </NavLink>
              <NavLink to="/goals" className={navLinkClass}>
                Goals
              </NavLink>
              <NavLink to="/recurring" className={navLinkClass}>
                Recurring
              </NavLink>
            </nav>
            <div className="flex items-center gap-4 border-l border-line pl-4">
              <span className="text-sm text-ink-soft hidden sm:inline">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-ink-soft hover:text-brick font-medium transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
