const BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail || "API Error")
  }

  return response.json()
}

export const api = {
  get: (path) => request(path),

  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body)
    }),

  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body)
    }),

  patch: (path) =>
    request(path, {
      method: "PATCH"
    }),

  delete: (path) =>
    request(path, {
      method: "DELETE"
    })
}
