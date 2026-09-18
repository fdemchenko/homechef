import { Link, useParams } from "react-router-dom";

import { formatDateTime, getRecipe, lines, photoUrl, Review } from "../api";
import { DifficultyMeter } from "../components/Difficulty";
import ReviewForm from "../components/ReviewForm";
import { RatingBadge, Stars } from "../components/Stars";
import { useAsync } from "../useAsync";

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

function ReviewItem({ review }: { review: Review }) {
  return (
    <li className="flex gap-4 border-b border-stone-100 py-5 last:border-0 dark:border-stone-800">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
        {initial(review.author)}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="font-medium">{review.author}</span>
          <Stars value={review.rating} className="h-3.5 w-3.5" />
          <span className="muted text-xs">
            {new Date(review.created_at).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        {review.text && (
          <p className="mt-1.5 leading-relaxed text-stone-600 dark:text-stone-300">
            {review.text}
          </p>
        )}
      </div>
    </li>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-2/3" />
      <div className="skeleton h-72 w-full" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
    </div>
  );
}

export default function RecipeDetailPage() {
  const { slug = "" } = useParams();
  const { data: recipe, error, setData } = useAsync(() => getRecipe(slug), [slug]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="font-medium">Could not load this recipe.</p>
        <p className="muted mt-1 text-sm">{error}</p>
        <Link to="/" className="btn btn-ghost mt-5">
          Back to all recipes
        </Link>
      </div>
    );
  }
  if (!recipe) return <DetailSkeleton />;

  // Prepend the new review and nudge the average, so the page reflects it at once.
  const onAdded = (review: Review) => {
    const reviews = [review, ...recipe.reviews];
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    setData({
      ...recipe,
      reviews,
      rating_count: reviews.length,
      rating_avg: Math.round(avg * 10) / 10,
    });
  };

  const photo = photoUrl(recipe.photo);
  const ingredients = lines(recipe.ingredients);
  const steps = lines(recipe.steps);

  return (
    <article className="animate-fade-up space-y-10">
      <Link to="/" className="muted inline-flex items-center gap-1.5 text-sm hover:text-stone-900 dark:hover:text-white">
        <span aria-hidden="true">←</span> All recipes
      </Link>

      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {recipe.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <RatingBadge average={recipe.rating_avg} count={recipe.rating_count} />
          <DifficultyMeter value={recipe.difficulty} />
          <time dateTime={recipe.created_at} className="muted text-sm">
            Added {formatDateTime(recipe.created_at)}
          </time>
        </div>
        {recipe.description && (
          <p className="muted mt-5 text-lg leading-relaxed">{recipe.description}</p>
        )}
      </header>

      {photo && (
        <img
          src={photo}
          alt={recipe.title}
          className="max-h-[28rem] w-full rounded-2xl object-cover shadow-card"
        />
      )}

      <div className="grid gap-10 md:grid-cols-[19rem_1fr]">
        {ingredients.length > 0 && (
          <section className="md:sticky md:top-24 md:self-start">
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold">Ingredients</h2>
              <ul className="mt-4 space-y-2.5">
                {ingredients.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {steps.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-semibold">How to make it</h2>
            <ol className="mt-5 space-y-5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500 text-sm font-semibold text-white dark:text-stone-950">
                    {i + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-stone-600 dark:text-stone-300">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <section className="space-y-5 border-t border-stone-200 pt-10 dark:border-stone-800">
        <h2 className="font-display text-2xl font-semibold">
          Reviews{recipe.rating_count > 0 && ` (${recipe.rating_count})`}
        </h2>
        <ReviewForm slug={recipe.slug} onAdded={onAdded} />
        {recipe.reviews.length > 0 ? (
          <ul>
            {recipe.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </ul>
        ) : (
          <p className="muted">Be the first to try it.</p>
        )}
      </section>
    </article>
  );
}
