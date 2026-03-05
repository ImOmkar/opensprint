import { Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import ProtectedRoute from "./components/ProtectedRoute"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import AuthSuccess from "./pages/AuthSuccess"
import SprintDetail from "./pages/SprintDetail"
import PublicSprint from "./pages/PublicSprint"
import PublicProfile from "./pages/PublicProfile"
import DivePage from "./pages/DivePage"
import GraphPage from "./pages/GraphPage"
import KnowledgeTimeline from "./pages/KnowledgeTimeline"
import NotFound from "./pages/NotFound"
import PublicDive from "./pages/PublicDive"

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid #374151"
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#111827"
            }
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#111827"
            }
          }
        }}
      />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="/u/:username/:sprintId" element={<PublicSprint />} />
        <Route path="/d/:diveId" element={<PublicDive/>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sprint/:id"
          element={
            <ProtectedRoute>
              <SprintDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dive/:diveId"
          element={
            <ProtectedRoute>
              <DivePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graph"
          element={
            <ProtectedRoute>
              <GraphPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth-success"
          element={
            <ProtectedRoute>
              <AuthSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline"
          element={
            <ProtectedRoute>
              <KnowledgeTimeline />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
