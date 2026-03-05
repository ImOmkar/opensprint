// const BASE_URL = import.meta.env.VITE_API_BASE_URL

// async function request(path, options = {}) {
//   const response = await fetch(`${BASE_URL}${path}`, {
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {})
//     },
//     ...options
//   })

//   // Handle session expiration globally
//   if (response.status === 401) {
//     console.log("Session expired")

//     if (window.location.pathname !== "/") {
//       window.location.href = "/"
//     }

//     throw new Error("Unauthorized")
//   }

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => null)
//     throw new Error(errorData?.detail || "API Error")
//   }

//   return response.json()
// }

// export const api = {
//   get: (path) => request(path),

//   post: (path, body) =>
//     request(path, {
//       method: "POST",
//       body: JSON.stringify(body)
//     }),

//   put: (path, body) =>
//     request(path, {
//       method: "PUT",
//       body: JSON.stringify(body)
//     }),

//   patch: (path) =>
//     request(path, {
//       method: "PATCH"
//     }),

//   delete: (path) =>
//     request(path, {
//       method: "DELETE"
//     })
// }


const BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request(path, options = {}) {

  const { skipAuthRedirect, ...fetchOptions } = options
  
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {})
    },
    ...fetchOptions
  })

  // Handle session expiration globally
  if (response.status === 401) {

    console.log("Session expired")

    if (!skipAuthRedirect) {
      if (window.location.pathname !== "/") {
        window.location.href = "/"
      }
    }

    throw new Error("Unauthorized")
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail || "API Error")
  }

  return response.json()
}

export const api = {

  get: (path, options = {}) =>
    request(path, options),

  post: (path, body, options = {}) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...options
    }),

  put: (path, body, options = {}) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options
    }),

  patch: (path, body, options = {}) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options
    }),

  delete: (path, options = {}) =>
    request(path, {
      method: "DELETE",
      ...options
    })
}