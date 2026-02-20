import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { linkService } from "../services/linkService"

function LinkedMarkdown({ content }) {

  const navigate = useNavigate()
  const [resolvedLinks, setResolvedLinks] = useState({})

  useEffect(() => {

    const matches = [...content.matchAll(/\[\[(.*?)\]\]/g)]

    matches.forEach(async (match) => {

      const title = match[1]

      if (!resolvedLinks[title]) {

        const dive = await linkService.resolveTitle(title)

        if (dive) {
          setResolvedLinks(prev => ({
            ...prev,
            [title]: dive
          }))
        }

      }

    })

  }, [content])


  const processContent = content.replace(
    /\[\[(.*?)\]\]/g,
    (_, title) => {

      if (resolvedLinks[title]) {

        return `[${title}](opensprint://${resolvedLinks[title]._id})`

      }

      return title

    }
  )


  return (
    <div className="prose prose-invert max-w-none">
  
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
  
            if (href.startsWith("opensprint://")) {
  
              const id = href.replace("opensprint://", "")
  
              return (
                <button
                  onClick={() => navigate(`/dive/${id}`)}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  {children}
                </button>
              )
            }
  
            return <a href={href}>{children}</a>
          }
        }}
      >
        {processContent}
      </ReactMarkdown>
  
    </div>
  )

}

export default LinkedMarkdown