import { useEffect, useState } from "react"
import ShareCard from "./ShareCard"

function ShareModal({
  isOpen,
  onClose,
  title,
  problem,
  username,
  streak,
  publicUrl
}) {

  const [isMobile, setIsMobile] = useState(false)
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState("gradient")

  useEffect(() => {

    const check = () => {
      setIsMobile(window.innerWidth < 768)
    }

    check()
    window.addEventListener("resize", check)

    return () => window.removeEventListener("resize", check)

  }, [])

  if (!isOpen) return null

  const handleCopy = async () => {
    if (!publicUrl) return

    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50">

      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Desktop */}
      {!isMobile && (

        <div className="absolute inset-0 flex items-center justify-center p-6">

          <div className="
            bg-gray-950
            border border-gray-800
            rounded-2xl
            p-6
            w-full
            max-w-4xl
            shadow-2xl
          ">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-semibold text-purple-400">
                Share Deep Dive
              </h2>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>

            </div>

            <div className="flex gap-2 mb-6 flex-wrap mx-5">

                {["gradient", "dark", "light", "neon"].map(t => (
                    <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`
                        px-3 py-1.5
                        rounded-full
                        text-xs
                        capitalize
                        border
                        transition
                        ${theme === t
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-gray-700 text-gray-400 hover:border-purple-500 hover:text-white"
                        }
                    `}
                    >
                    {t}
                    </button>
                ))}

            </div>

            <ShareCard
              title={title}
              problem={problem}
              username={username}
              streak={streak}
              publicUrl={publicUrl}
              theme={theme}
            />

          </div>

        </div>

      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (

        <div className="absolute bottom-0 left-0 right-0">

          <div className="
            bg-gray-950
            border-t border-gray-800
            rounded-t-3xl
            p-5
            h-[60vh]
            overflow-y-auto
          ">

            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4" />

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-lg font-semibold text-purple-400">
                Share Deep Dive
              </h2>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>

            </div>

            <div className="flex gap-2 mb-6 flex-wrap">

                {["gradient", "dark", "light", "neon"].map(t => (
                    <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`
                        px-3 py-1.5
                        rounded-full
                        text-xs
                        capitalize
                        border
                        transition
                        ${theme === t
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-gray-700 text-gray-400 hover:border-purple-500 hover:text-white"
                        }
                    `}
                    >
                    {t}
                    </button>
                ))}

            </div>

            <ShareCard
              title={title}
              problem={problem}
              username={username}
              streak={streak}
              publicUrl={publicUrl}
              theme={theme}
            />

          </div>

        </div>

      )}

    </div>
  )
}

export default ShareModal