import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useState } from "react"

function MarkdownEditor({
  label = "Content",
  value = "",
  onChange,
  onImprove,
  improving,
  compact
}) {

  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="mb-6">

      {/* Top Header */}
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-300">
          {label}
        </label>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-purple-400 hover:text-purple-300"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      <div className={`grid gap-4 ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>

        {/* Editor Side */}
        <div className="relative">

          {/* Improve Button (inside box) */}
          {onImprove && (
            <button
              type="button"
              onClick={onImprove}
              disabled={improving}
              className="
                absolute top-3 right-3 text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded hover:bg-purple-600/30
              "
            >
              {improving ? "Improving..." : "✨ Improve"}
            </button>
          )}

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="
              w-full h-40
              bg-gray-950
              border border-gray-700
              rounded-xl
              p-3 pr-24
              text-white
              font-sans
              resize-none
              focus:border-purple-500
              outline-none
            "
            placeholder={`Write ${label.toLowerCase()} in markdown...`}
          />

        </div>

        {/* Preview Side */}
        {showPreview && (
          <div className="h-40 overflow-y-auto bg-gray-900 border border-gray-800 rounded-xl p-3">

            {value ? (
              <div className="prose prose-invert max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Preview will appear here...
              </p>
            )}

          </div>
        )}

      </div>

    </div>
  )
}

export default MarkdownEditor