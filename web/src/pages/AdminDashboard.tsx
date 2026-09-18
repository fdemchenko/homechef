import { useState } from "react";
import { Link } from "react-router-dom";

import { deleteRecipe } from "../admin";
import { formatDate, listRecipes, photoUrl } from "../api";
import { useAsync } from "../useAsync";

export default function AdminDashboardPage() {
  const { data: recipes, error, setData } = useAsync(listRecipes, []);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(slug: string, title: string) {
    if (!confirm(`Delete "${title}" and all of its reviews?`)) return;
    setBusy(slug);
    try {
      await deleteRecipe(slug);
      setData((recipes ?? []).filter((r) => r.slug !== slug));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (error) return <p className="text-red-600 dark:text-red-400">Could not load recipes: {error}</p>;
  if (!recipes) return <div className="skeleton h-64 w-full" />;

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Your recipes</h1>
          <p className="muted mt-1 text-sm">
            {recipes.length} {recipes.length === 1 ? "dish" : "dishes"} published
          </p>
        </div>
        <Link to="/admin/new" className="btn btn-primary">
          <span aria-hidden="true">+</span> New recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl">🍳</div>
          <p className="mt-3 font-medium">Nothing yet.</p>
          <p className="muted mt-1 text-sm">Add your first dish.</p>
        </div>
      ) : (
        <ul className="card divide-y divide-stone-100 overflow-hidden dark:divide-stone-800">
          {recipes.map((recipe) => (
            <li
              key={recipe.id}
              className="flex flex-wrap items-center gap-4 p-4 transition hover:bg-stone-50 dark:hover:bg-stone-800/50"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                {photoUrl(recipe.photo) ? (
                  <img
                    src={photoUrl(recipe.photo)!}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center opacity-40">🍽️</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/recipes/${recipe.slug}`}
                  className="font-medium hover:text-amber-700 dark:hover:text-amber-400"
                >
                  {recipe.title}
                </Link>
                <p className="muted truncate text-sm">
                  {recipe.rating_count > 0
                    ? `${recipe.rating_avg.toFixed(1)} ★ · ${recipe.rating_count} reviews`
                    : "no reviews yet"}
                  {" · added "}
                  {formatDate(recipe.created_at)}
                </p>
              </div>

              <div className="flex gap-2">
                <Link to={`/admin/${recipe.slug}/edit`} className="btn btn-ghost px-3 py-2">
                  Edit
                </Link>
                <button
                  onClick={() => remove(recipe.slug, recipe.title)}
                  disabled={busy === recipe.slug}
                  className="btn btn-danger px-3 py-2"
                >
                  {busy === recipe.slug ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
