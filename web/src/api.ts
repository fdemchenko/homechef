export type Review = {
  id: number;
  author: string;
  rating: number;
  text: string;
  created_at: string;
};

export type Recipe = {
  id: number;
  slug: string;
  title: string;
  description: string;
  photo: string | null;
  difficulty: number; // 1..5
  created_at: string;
  rating_avg: number;
  rating_count: number;
};

export type RecipeDetail = Recipe & {
  ingredients: string;
  steps: string;
  reviews: Review[];
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json() as Promise<T>;
}

export const listRecipes = (q = "") => {
  const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return request<Recipe[]>(`/api/recipes${query}`);
};

export const getRecipe = (slug: string) =>
  request<RecipeDetail>(`/api/recipes/${slug}`);

export const addReview = (
  slug: string,
  review: { author: string; rating: number; text: string },
) =>
  request<Review>(`/api/recipes/${slug}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });

/** Recipes store only a filename; the API serves the file from /media. */
export const photoUrl = (photo: string | null) =>
  photo ? `/media/${photo}` : null;

/** "1 onion\n2 eggs" -> ["1 onion", "2 eggs"] */
export const lines = (text: string) =>
  text.split("\n").map((l) => l.trim()).filter(Boolean);

export const DIFFICULTY_LABELS = [
  "",
  "Very easy",
  "Easy",
  "Medium",
  "Hard",
  "Very hard",
] as const;

/** The API sends UTC with an offset, so these render in the reader's own zone. */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
