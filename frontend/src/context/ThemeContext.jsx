import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {

  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.body.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)