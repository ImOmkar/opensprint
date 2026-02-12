import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/client"

function AuthSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/auth/github/me")
      .then(() => navigate("/dashboard"))
      .catch(() => navigate("/"))
  }, [])
  
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Authenticating...
    </div>
  )
}

export default AuthSuccess
