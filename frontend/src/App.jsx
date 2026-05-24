import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import DashboardPage from "./pages/DashboardPage"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import CodingInterviewPage from "./pages/CodingInterviewPage"
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/signup" element={<SignupPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/coding-interview" element={<CodingInterviewPage />} />
    </Routes>
  )
}

export default App