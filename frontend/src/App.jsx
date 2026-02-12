import { Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import AuthSuccess from "./pages/AuthSuccess"
import SprintDetail from "./pages/SprintDetail"
import PublicSprint from "./pages/PublicSprint"
import PublicProfile from "./pages/PublicProfile"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sprint/:id" element={<SprintDetail />} />
      <Route path="/auth-success" element={<AuthSuccess />} />

      <Route path="/u/:username" element={<PublicProfile />} />
      <Route path="/u/:username/:sprintId" element={<PublicSprint />} />

    
    </Routes>
  )
}

export default App
