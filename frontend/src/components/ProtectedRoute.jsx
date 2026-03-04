import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner"

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <Spinner text="Checking authentication..."/>
    }

    if (!user) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute