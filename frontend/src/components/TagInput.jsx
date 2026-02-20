import { useState } from "react"

function TagInput({ value, onChange, placeholder = "Add tags..." }) {

  // ALWAYS normalize to array
  const tags = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,\s]+/).map(t => t.trim()).filter(Boolean)
      : []

  const [input, setInput] = useState("")

  const addTag = (tag) => {

    const clean = tag.trim().replace(/^#/, "")

    if (!clean) return
    if (tags.includes(clean)) return

    onChange([...tags, clean])
  }

  const removeTag = (tag) => {
    onChange(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e) => {

    if (["Enter", ",", " "].includes(e.key)) {

      e.preventDefault()

      if (input.trim()) {
        addTag(input)
        setInput("")
      }
    }

    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleChange = (e) => {

    const val = e.target.value

    if (val.includes(",") || val.includes(" ")) {

      const parts = val.split(/[,\s]+/)

      parts.slice(0, -1).forEach(addTag)

      setInput(parts[parts.length - 1] || "")

    } else {
      setInput(val)
    }
  }

  return (
    <div className="bg-gray-950 border border-gray-700 rounded-lg p-2 focus-within:border-purple-500 transition">

      <div className="flex flex-wrap gap-2 items-center">

        {tags.map(tag => (
          <div
            key={tag}
            className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs"
          >
            #{tag}

            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-purple-400 hover:text-red-400 ml-1"
            >
              ×
            </button>

          </div>
        ))}

        <input
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none text-sm text-white flex-1 min-w-[120px]"
          placeholder={placeholder}
        />

      </div>

    </div>
  )
}

export default TagInput