import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { userService } from "../services/userService"

function AuthSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    userService
      .getMe({ skipAuthRedirect: true })
      .then((data) => {
        toast.success(`Welcome ${data.username}`)
        navigate("/dashboard")
      })
      .catch(() => navigate("/"))
  }, [navigate])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Authenticating...
    </div>
  )
}

export default AuthSuccess
