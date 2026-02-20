import { diffWords } from "diff"

function DiffViewer({ oldText = "", newText = "" }) {

  const diff = diffWords(oldText, newText)

  return (
    <div className="bg-gray-950 border border-gray-800 rounded p-3 text-sm leading-relaxed whitespace-pre-wrap">

      {diff.map((part, index) => {

        if (part.added) {
          return (
            <span
              key={index}
              className="bg-green-500/20 text-green-300"
            >
              {part.value}
            </span>
          )
        }

        if (part.removed) {
          return (
            <span
              key={index}
              className="bg-red-500/20 text-red-300 line-through"
            >
              {part.value}
            </span>
          )
        }

        return (
          <span key={index}>
            {part.value}
          </span>
        )

      })}

    </div>
  )
}

export default DiffViewer