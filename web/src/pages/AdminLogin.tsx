import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAdmin } from "../admin";

export default function AdminLoginPage() {
  const { loggedIn, logIn } = useAdmin();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  if (loggedIn) return <Navigate to="/admin" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      await logIn(token.trim());
      navigate("/admin");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-8 max-w-sm animate-fade-up p-8">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-xl shadow-sm">
        🔑
      </div>
      <h1 className="font-display mt-5 text-2xl font-semibold">Admin</h1>
      <p className="muted mt-1.5 text-sm leading-relaxed">
        Paste the <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs dark:bg-stone-800">ADMIN_TOKEN</code>{" "}
        from <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs dark:bg-stone-800">api/.env</code>, or run{" "}
        <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs dark:bg-stone-800">make token</code>.
      </p>

      <input
        type="password"
        autoFocus
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Admin token"
        className="field mt-6"
      />

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={checking || token.trim() === ""}
        className="btn btn-primary mt-5 w-full"
      >
        {checking ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
