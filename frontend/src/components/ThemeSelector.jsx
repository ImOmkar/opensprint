import { useTheme } from "../context/ThemeContext"
import { userService } from "../services/userService"
import toast from "react-hot-toast"

const themes = [
  {
    id: "dark",
    title: "Dark",
    desc: "Clean & focused",
    preview: "bg-black text-white"
  },
  {
    id: "terminal",
    title: "Terminal",
    desc: "Hacker mode",
    preview: "bg-black text-green-400 font-mono"
  },
  {
    id: "minimal",
    title: "Minimal",
    desc: "Research style",
    preview: "bg-white text-black"
  }
]

export default function ThemeSelector() {

  const { theme, setTheme } = useTheme()

  const handleChange = async (t) => {
    setTheme(t)

    try {
      await userService.updateTheme({ profile_theme: t })
      toast.success("Theme updated")
    } catch {
      toast.error("Failed to update theme")
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      {themes.map(t => (

        <div
          key={t.id}
          onClick={() => handleChange(t.id)}
          className={`
            cursor-pointer
            border rounded-xl p-4
            transition hover:scale-[1.02]
            ${theme === t.id
              ? "border-purple-500"
              : "border-gray-800"}
          `}
        >

          {/* Preview */}
          <div className={`h-16 rounded mb-3 ${t.preview}`}>
            <div className="text-xs p-2 opacity-70">
              Preview UI
            </div>
          </div>

          {/* Info */}
          <p className="text-sm font-semibold">
            {t.title}
          </p>

          <p className="text-xs text-gray-400">
            {t.desc}
          </p>

        </div>

      ))}

    </div>
  )
}