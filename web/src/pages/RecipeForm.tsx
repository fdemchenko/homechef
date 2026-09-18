import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { createRecipe, deleteReview, RecipeInput, updateRecipe, uploadPhoto } from "../admin";
import { getRecipe, photoUrl, RecipeDetail } from "../api";
import { DifficultyInput } from "../components/Difficulty";
import { Stars } from "../components/Stars";

const EMPTY: RecipeInput = {
  title: "",
  description: "",
  ingredients: "",
  steps: "",
  difficulty: 3,
};

/** Serves both /admin/new and /admin/:slug/edit. */
export default function RecipeFormPage() {
  const { slug } = useParams();
  const editing = Boolean(slug);
  const navigate = useNavigate();

  const [form, setForm] = useState<RecipeInput>(EMPTY);
  const [existing, setExisting] = useState<RecipeDetail | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getRecipe(slug)
      .then((recipe) => {
        setExisting(recipe);
        setForm({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          difficulty: recipe.difficulty,
        });
      })
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (key: keyof RecipeInput) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("A title, at least.");

    setSaving(true);
    setError(null);
    try {
      // Create (or update) first: the photo endpoint needs an existing recipe.
      const saved = editing ? await updateRecipe(slug!, form) : await createRecipe(form);
      if (file) await uploadPhoto(saved.slug, file);
      navigate(`/recipes/${saved.slug}`);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  async function removeReview(id: number) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      setExisting((prev) =>
        prev ? { ...prev, reviews: prev.reviews.filter((r) => r.id !== id) } : prev,
      );
    } catch (e) {
      alert((e as Error).message);
    }
  }

  const currentPhoto = preview ?? photoUrl(existing?.photo ?? null);
  const countOf = (text: string) => text.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="mx-auto max-w-2xl animate-fade-up space-y-8">
      <Link to="/admin" className="muted inline-flex items-center gap-1.5 text-sm hover:text-stone-900 dark:hover:text-white">
        <span aria-hidden="true">←</span> Back to admin
      </Link>

      <form onSubmit={submit} className="card p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {editing ? "Edit recipe" : "New recipe"}
        </h1>

        <div className="mt-7 space-y-6">
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              className="field mt-2"
              value={form.title}
              maxLength={160}
              onChange={(e) => set("title")(e.target.value)}
              placeholder="Deruny"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Short description</span>
            <input
              className="field mt-2"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="Potato pancakes, crispy at the edges."
            />
          </label>

          <div>
            <span className="text-sm font-medium">How hard was it to make?</span>
            <DifficultyInput
              value={form.difficulty}
              onChange={(difficulty) => setForm((prev) => ({ ...prev, difficulty }))}
            />
          </div>

          <label className="block">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Ingredients</span>
              <span className="muted text-xs">
                one per line · {countOf(form.ingredients)}
              </span>
            </div>
            <textarea
              className="field mt-2 resize-y font-mono text-sm"
              rows={6}
              value={form.ingredients}
              onChange={(e) => set("ingredients")(e.target.value)}
              placeholder={"4 potatoes\n1 onion\n1 egg"}
            />
          </label>

          <label className="block">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Steps</span>
              <span className="muted text-xs">
                one per line · {countOf(form.steps)}
              </span>
            </div>
            <textarea
              className="field mt-2 resize-y"
              rows={7}
              value={form.steps}
              onChange={(e) => set("steps")(e.target.value)}
              placeholder={"Grate the potatoes and onion.\nSqueeze out the water."}
            />
          </label>

          <div>
            <span className="text-sm font-medium">Photo</span>
            <div className="mt-2 flex items-center gap-5">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
                {currentPhoto ? (
                  <img src={currentPhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-2xl opacity-40">🍽️</div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200 dark:file:bg-stone-800 dark:file:text-stone-200 dark:hover:file:bg-stone-700"
                />
                {editing && existing?.photo && file && (
                  <p className="muted mt-2 text-xs">Saving will replace the current photo.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="mt-5 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button type="submit" disabled={saving} className="btn btn-primary mt-7">
          {saving ? "Saving…" : editing ? "Save changes" : "Publish recipe"}
        </button>
      </form>

      {editing && existing && existing.reviews.length > 0 && (
        <section className="card p-8">
          <h2 className="font-display text-lg font-semibold">Reviews</h2>
          <p className="muted mt-0.5 text-sm">Remove anything that looks like spam.</p>
          <ul className="mt-5 divide-y divide-stone-100 dark:divide-stone-800">
            {existing.reviews.map((review) => (
              <li key={review.id} className="flex items-start gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Stars value={review.rating} className="h-3.5 w-3.5" />
                    <span className="font-medium">{review.author}</span>
                  </div>
                  {review.text && (
                    <p className="muted mt-1 text-sm leading-relaxed">{review.text}</p>
                  )}
                </div>
                <button
                  onClick={() => removeReview(review.id)}
                  className="btn btn-danger px-3 py-1.5 text-xs"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
