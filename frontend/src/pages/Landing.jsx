import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { userService } from "../services/userService"
import { useAuth } from "../context/AuthContext"

function Landing() {

  const { isAuthenticated, loading } = useAuth() 
  const navigate = useNavigate()

  // useEffect(() => {
  //   userService.getMe()
  //     .then(() => {
  //       navigate("/dashboard", { replace: true })
  //     })
  //     .catch(() => {})
  // }, [])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard", { replace: true })
    }
  }, [loading, isAuthenticated])

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github/login`
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Animated Background Blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-green-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Navbar */}
        <div className="flex justify-between items-center px-6 py-5 max-w-6xl mx-auto w-full">

          <h1 className="text-xl font-bold tracking-wide">
            <span className="text-green-400">Open</span>Sprint
          </h1>

          <button
            onClick={handleLogin}
            className="hidden sm:block bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Login
          </button>

        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center mt-10">

          <h2 className="font-display text-4xl sm:text-6xl font-extrabold leading-[1.15] mb-8 pb-2">
            Build Your
            <span className="
                block
                pb-3
                bg-gradient-to-r
                from-purple-400 via-green-400 to-purple-400
                bg-clip-text text-transparent
                animate-gradient
                bg-[length:200%_200%]
              ">
              Engineering Brain
            </span>
          </h2>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mb-10">
            Deep dives. AI writing assistant. Knowledge streaks.  
            Turn daily engineering thinking into structured intelligence.
          </p>

          <button
            onClick={handleLogin}
            className="
              bg-gradient-to-r from-green-500 to-purple-500
              hover:scale-105
              transition
              text-black
              px-10 py-4
              rounded-2xl
              font-semibold
              text-lg
              shadow-xl 
            "
            // hover:shadow-green-500/
          >
            🚀 Start with GitHub
          </button>

        </div>

        {/* Product Preview Mock */}
        <div className="px-6 pb-10 pt-10">

          <div className="max-w-5xl mx-auto bg-gray-900/60 backdrop-blur border border-gray-800 rounded-3xl p-6 shadow-2xl">

            <div className="text-green-400 text-sm mb-3">
              🔥 Current Streak: 12 days
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-left">
              <h3 className="text-purple-400 font-semibold mb-2">
                Investigating MongoDB Performance Bottleneck
              </h3>
              <p className="text-gray-400 text-sm">
                Hypothesis: Missing compound index on user_id + created_at causing
                aggregation slowdown under concurrency.
              </p>
            </div>

          </div>

        </div>

        {/* Stats Section */}
        <StatsSection />

        {/* Features */}
        <div className="py-24 px-6">

          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            <FeatureCard icon="🧠" title="Structured Deep Dives"
              description="Problem → Hypothesis → Tests → Conclusion workflow." />

            <FeatureCard icon="✨" title="AI Writing Copilot"
              description="Improve clarity, grammar, structure instantly." />

            <FeatureCard icon="🔥" title="Knowledge Streaks"
              description="Stay consistent with activity heatmaps & milestones." />

            <FeatureCard icon="🔗" title="Backlinks"
              description="Connect related insights across sprints." />

            <FeatureCard icon="📊" title="AI Sprint Summary"
              description="Automatic high-level sprint analysis." />

            <FeatureCard icon="🏷" title="Smart Tag Suggestions"
              description="AI extracts technical tags from content." />

          </div>

        </div>

        {/* Footer */}
        <div className="py-10 text-center text-gray-500 text-sm border-t border-gray-900">
          Built for engineers who think deeply.
        </div>

      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="
      bg-gray-900/60
      backdrop-blur
      border border-gray-800
      rounded-2xl
      p-6
      hover:border-purple-500/40
      hover:shadow-xl
      hover:shadow-purple-500/10
      transition
      
    ">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function StatsSection() {

  const [count, setCount] = useState(0)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setCount(i)
      if (i >= 120) clearInterval(interval)
    }, 15)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="py-20 px-6 border-y border-gray-900">

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">

        <div>
          <div className="text-4xl font-bold text-green-400">
            {count}+
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Deep Dives Logged
          </p>
        </div>

        <div>
          <div className="text-4xl font-bold text-purple-400">
            98%
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Writing Clarity Improved
          </p>
        </div>

        <div>
          <div className="text-4xl font-bold text-green-400">
            30 Day
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Knowledge Streak Goal
          </p>
        </div>

      </div>

    </div>
  )
}

export default Landing