import { Link } from "react-router-dom"

function PublicLayout({ children }) {

  return (

    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="border-b border-gray-800">

        <div className="
          max-w-5xl mx-auto
          px-4 sm:px-6
          py-4
          flex justify-between items-center
        ">

          <Link
            to="/"
            className="text-green-400 font-bold text-lg hover:text-green-300"
          >
            OpenSprint
          </Link>

          <Link
            to="/"
            className="
              text-sm
              text-gray-400
              hover:text-white
              transition
            "
          >
            Sign in
          </Link>

        </div>

      </header>


      {/* Content */}
      <main className="
        max-w-5xl mx-auto
        px-4 sm:px-6
        py-8 sm:py-10
      ">
        {children}
      </main>

    </div>

  )
}

export default PublicLayout