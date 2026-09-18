import { useState } from "react";
import { Link } from "react-router-dom";

import { formatDate, listRecipes, photoUrl, Recipe } from "../api";
import { DifficultyMeter } from "../components/Difficulty";
import SearchBar from "../components/SearchBar";
import { RatingBadge } from "../components/Stars";
import { useAsync, useDebounced } from "../useAsync";

function Card({ recipe, index }: { recipe: Recipe; index: number }) {
  const photo = photoUrl(recipe.photo);

  return (
    <Link
      to={`/recipes/${recipe.slug}`}
      style={{ animationDelay: `${index * 60}ms` }}
      className="card group animate-fade-up overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        {photo ? (
          <img
            src={photo}
            alt={recipe.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="muted grid h-full place-items-center text-4xl opacity-40">🍽️</div>
        )}

        {recipe.rating_count > 0 && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-800 shadow-sm backdrop-blur dark:bg-stone-900/90 dark:text-stone-100">
            <span className="text-amber-500 dark:text-amber-400">★</span>
            <span className="tabular-nums">{recipe.rating_avg.toFixed(1)}</span>
          </span>
        )}
      </div>

      <div className="p-5">
        <h2 className="font-display text-lg font-semibold leading-snug transition group-hover:text-amber-700 dark:group-hover:text-amber-400">
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="muted mt-1.5 line-clamp-2 text-sm leading-relaxed">
            {recipe.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
          <RatingBadge average={recipe.rating_avg} count={recipe.rating_count} />
          <DifficultyMeter
            value={recipe.difficulty}
            showLabel={false}
            className="shrink-0"
          />
        </div>

        <time
          dateTime={recipe.created_at}
          className="muted mt-2 block text-xs"
        >
          Added {formatDate(recipe.created_at)}
        </time>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-4/5" />
      </div>
    </div>
  );
}

export default function RecipeListPage() {
  const [query, setQuery] = useState("");
  const search = useDebounced(query, 300);
  const { data: recipes, error } = useAsync(() => listRecipes(search), [search]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="font-medium">Could not load the recipes.</p>
        <p className="muted mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          What I&rsquo;ve been cooking
        </h1>
        <p className="muted mt-3 text-lg leading-relaxed">
          Every dish here came out of my kitchen. Try one, then tell me how it went.
        </p>
      </div>

      <div className="mb-8 max-w-xl">
        <SearchBar value={query} onChange={setQuery} count={recipes?.length} />
      </div>

      {!recipes ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl">{search ? "🔍" : "🍳"}</div>
          <p className="mt-3 font-medium">
            {search ? `Nothing matches "${search}".` : "No recipes yet."}
          </p>
          <p className="muted mt-1 text-sm">
            {search ? (
              <button
                onClick={() => setQuery("")}
                className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-white"
              >
                Clear the search
              </button>
            ) : (
              "Log in as admin and add the first dish."
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe, i) => (
            <Card key={recipe.id} recipe={recipe} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
