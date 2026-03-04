import React, { useRef, useState } from "react"
import * as htmlToImage from "html-to-image"

function stripWikiLinks(text = "") {
  return text.replace(/\[\[(.*?)\]\]/g, "$1")
}

function ShareCard({
    title,
    problem,
    username,
    streak,
    publicUrl,
    theme = "gradient"
}) {

  const cardRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return

    const dataUrl = await htmlToImage.toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true
    })

    const link = document.createElement("a")
    link.download = "opensprint-card.png"
    link.href = dataUrl
    link.click()
  }

  const handleCopy = async () => {
    if (!publicUrl) return

    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">

      {/* Responsive wrapper */}
      <div className="w-full max-w-[800px] aspect-[800/420]">

        <div
          ref={cardRef}
        //   className="
        //     w-full h-full
        //     rounded-3xl
        //     p-6 sm:p-10
        //     relative
        //     overflow-hidden
        //     bg-gradient-to-br
        //     from-purple-600 via-indigo-600 to-blue-600
        //     text-white
        //     shadow-2xl
        //   "
        className={`
            w-full h-full
            rounded-3xl
            p-6 sm:p-10
            relative
            overflow-hidden
            shadow-2xl
            ${
              theme === "gradient" &&
              "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white"
            }
            ${
              theme === "dark" &&
              "bg-black text-white border border-gray-800"
            }
            ${
              theme === "light" &&
              "bg-white text-black"
            }
            ${
              theme === "neon" &&
              "bg-black text-green-400 border border-green-500 "
            }
          `}
        >

          {/* Glow overlay */}
          {theme === "gradient" && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            )}

          <div className="relative z-10 flex flex-col justify-between h-full">

            {/* Top */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4 sm:mb-6">
                {title}
              </h1>

              <p className="text-sm sm:text-lg  line-clamp-4">
                {stripWikiLinks(problem)}
              </p>
            </div>

            {/* Bottom */}
            <div className="flex justify-between items-end">

              <div>
                <div className="text-xs sm:text-sm text-white/70">
                  Built with
                </div>
                <div className="text-lg sm:text-xl font-semibold tracking-wide">
                  OpenSprint
                </div>
              </div>

              <div className="text-right">
                {streak > 0 && (
                  <div className="text-xs sm:text-sm mb-1">
                    🔥 {streak} Day Streak
                  </div>
                )}
                <div className="text-sm sm:text-lg font-semibold">
                  @{username}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-4">

        <button
          onClick={handleDownload}
          className="
            px-6 py-3
            bg-white text-black
            rounded-xl
            font-semibold
            hover:bg-gray-200
            transition
          "
        >
          Download Image
        </button>

        <button
          onClick={handleCopy}
          className="
            px-6 py-3
            bg-purple-600
            text-white
            rounded-xl
            font-semibold
            hover:bg-purple-500
            transition
          "
        >
          {copied ? "Copied ✓" : "Copy Public Link"}
        </button>

      </div>

    </div>
  )
}

export default ShareCard