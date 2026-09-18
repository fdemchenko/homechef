import { FormEvent, useState } from "react";

import { addReview, Review } from "../api";
import { StarInput } from "./Stars";

type Props = { slug: string; onAdded: (review: Review) => void };

const HINTS = ["", "Not for me", "It was fine", "Good", "Really good", "Making it again"];

export default function ReviewForm({ slug, onAdded }: Props) {
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!author.trim() || rating === 0) {
      setError("A name and at least one star, please.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      onAdded(await addReview(slug, { author: author.trim(), rating, text }));
      setAuthor("");
      setRating(0);
      setText("");
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6">
      <h3 className="font-display text-lg font-semibold">Leave a review</h3>
      <p className="muted mt-0.5 text-sm">No account needed.</p>

      <div className="mt-5 space-y-4">
        <div className="flex items-center gap-3">
          <StarInput value={rating} onChange={setRating} />
          <span className="muted text-sm">{HINTS[rating]}</span>
        </div>

        <input
          className="field"
          placeholder="Your name"
          maxLength={60}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          className="field resize-y"
          placeholder="How did it turn out?"
          rows={3}
          maxLength={2000}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {done && (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
          Thank you, your review is up.
        </p>
      )}

      <button type="submit" disabled={saving} className="btn btn-primary mt-5">
        {saving ? "Sending…" : "Post review"}
      </button>
    </form>
  );
}
