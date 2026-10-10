import axios from "axios";

// Same-origin by default (Vercel serves the API under /api). Set VITE_API_URL to use a separate backend.
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api/v1`,
  withCredentials: true,
  timeout: 20000,
});

// Access tokens are short-lived. On a 401, refresh once (shared across parallel requests) and retry.
let refreshing = null;
let onSessionExpired = () => {};
export const setSessionExpiredHandler = (fn) => { onSessionExpired = fn; };

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        refreshing ??= api.post("/auth/refresh").finally(() => { refreshing = null; });
        await refreshing;
        return api(original);
      } catch {
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  }
);

/** Unwraps { success, data } responses. */
export const unwrap = (promise) => promise.then((res) => res.data.data);

export const errorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  (error?.code === "ECONNABORTED" ? "The server took too long to respond" : null) ||
  (error?.message === "Network Error" ? "Can't reach the server. Check your connection." : null) ||
  fallback;

/** Builds multipart form data, skipping empty values. */
export function toFormData(values) {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (value instanceof FileList) {
      if (value[0]) fd.append(key, value[0]);
    } else {
      fd.append(key, value);
    }
  });
  return fd;
}

export async function downloadFile(url, filename) {
  const res = await api.get(url, { responseType: "blob" });
  const href = URL.createObjectURL(res.data);
  const a = Object.assign(document.createElement("a"), { href, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
