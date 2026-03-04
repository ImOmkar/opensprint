import { useNavigate } from "react-router-dom"

function NotFound() {

  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

      <h1 className="text-6xl font-bold text-green-400 mb-4">
        404
      </h1>

      <p className="text-gray-400 mb-6">
        Page not found
      </p>

      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400"
      >
        Go Home
      </button>

    </div>
  )
}

export default NotFound