import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { RecipeDetail } from "./api";

const KEY = "homechef-admin-token";

/** The token is kept in localStorage, so a reload keeps you logged in. */
const stored = () => localStorage.getItem(KEY) ?? "";

type AdminValue = {
  token: string;
  loggedIn: boolean;
  logIn: (token: string) => Promise<void>;
  logOut: () => void;
};

const AdminContext = createContext<AdminValue>(null!);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(stored);

  const value = useMemo<AdminValue>(
    () => ({
      token,
      loggedIn: token !== "",
      async logIn(candidate: string) {
        const res = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${candidate}` },
        });
        if (!res.ok) throw new Error("That token was not accepted.");
        localStorage.setItem(KEY, candidate);
        setToken(candidate);
      },
      logOut() {
        localStorage.removeItem(KEY);
        setToken("");
      },
    }),
    [token],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => useContext(AdminContext);

// ---------- authenticated calls ----------

async function adminRequest<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    // No Content-Type for FormData: the browser sets the boundary itself.
    headers: { ...init.headers, Authorization: `Bearer ${stored()}` },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Your admin token was rejected. Please log in again.");
  }
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
}

export type RecipeInput = {
  title: string;
  description: string;
  ingredients: string;
  steps: string;
  difficulty: number; // 1..5
};

const asJson = (input: RecipeInput): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(input),
});

export const createRecipe = (input: RecipeInput) =>
  adminRequest<RecipeDetail>("/api/recipes", { method: "POST", ...asJson(input) });

export const updateRecipe = (slug: string, input: RecipeInput) =>
  adminRequest<RecipeDetail>(`/api/recipes/${slug}`, { method: "PUT", ...asJson(input) });

export const deleteRecipe = (slug: string) =>
  adminRequest<void>(`/api/recipes/${slug}`, { method: "DELETE" });

export const uploadPhoto = (slug: string, file: File) => {
  const body = new FormData();
  body.append("file", file);
  return adminRequest<RecipeDetail>(`/api/recipes/${slug}/photo`, { method: "POST", body });
};

export const deleteReview = (id: number) =>
  adminRequest<void>(`/api/reviews/${id}`, { method: "DELETE" });
