import { apiFetch } from "./api";

let changelogsPromise: Promise<any> | null = null;

export function getCachedChangelogs() {
  if (!changelogsPromise) {
    changelogsPromise = apiFetch("/changelogs")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch changelogs");
        return res.json();
      })
      .catch((err) => {
        changelogsPromise = null;
        throw err;
      });
  }

  return changelogsPromise;
}
