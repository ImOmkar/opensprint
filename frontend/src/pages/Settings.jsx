import { useEffect, useState } from "react"
import DashboardLayout from "../components/DashboardLayout"
import ThemeSelector from "../components/ThemeSelector"
import { userService } from "../services/userService"
import { useNavigate } from "react-router-dom"

export default function Settings() {

    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {    
        userService.getMe()
          .then(setUser)
          .catch(() => navigate("/"))
      }, [])

    return (
        <DashboardLayout user={user}>
            <div className="px-4 py-6">
                <h1 className="text-xl font-bold mb-6">
                    Settings
                </h1>
                <div className="bg-[var(--card)] border border-gray-800 rounded-xl p-5">
                    <p className="text-sm text-gray-400 mb-4">
                        Appearance
                    </p>
                    <ThemeSelector />
                </div>
            </div>
        </DashboardLayout>
    )
}