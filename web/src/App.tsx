import { ReactNode } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";

import { useAdmin } from "./admin";
import ThemeToggle from "./components/ThemeToggle";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLogin";
import RecipeDetailPage from "./pages/RecipeDetail";
import RecipeFormPage from "./pages/RecipeForm";
import RecipeListPage from "./pages/RecipeList";

function RequireAdmin({ children }: { children: ReactNode }) {
  const { loggedIn } = useAdmin();
  return loggedIn ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function Nav() {
  const { loggedIn, logOut } = useAdmin();
  const link = "muted text-sm transition hover:text-stone-900 dark:hover:text-white";

  return (
    <nav className="flex items-center gap-4">
      {loggedIn ? (
        <>
          <Link to="/admin" className={link}>
            Admin
          </Link>
          <button onClick={logOut} className={link}>
            Log out
          </button>
        </>
      ) : (
        <Link to="/admin/login" className={link}>
          Admin
        </Link>
      )}
      <ThemeToggle />
    </nav>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/80 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500 text-base shadow-sm transition group-hover:rotate-6">
              🍳
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              Coocker
            </span>
          </Link>
          <Nav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Routes>
          <Route path="/" element={<RecipeListPage />} />
          <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/new"
            element={
              <RequireAdmin>
                <RecipeFormPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/:slug/edit"
            element={
              <RequireAdmin>
                <RecipeFormPage />
              </RequireAdmin>
            }
          />
          <Route
            path="*"
            element={<p className="muted">Nothing here. Try the recipe list.</p>}
          />
        </Routes>
      </main>

      <footer className="border-t border-stone-200 py-6 dark:border-stone-800">
        <p className="muted mx-auto max-w-5xl px-4 text-sm">
          Cooked and written at home.
        </p>
      </footer>
    </div>
  );
}
