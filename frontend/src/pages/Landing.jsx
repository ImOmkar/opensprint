function Landing() {

    const handleLogin = () => {
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github/login`
    }
  
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-6 text-green-400">
          OpenSprint
        </h1>
  
        <button
          onClick={handleLogin}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Login with GitHub
        </button>
      </div>
    )
  }
  
  export default Landing
  