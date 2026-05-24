import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function SignupPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        "http://192.168.137.1:5000/api/auth/signup",
        formData
      )

      alert(response.data.message)

      navigate("/login")
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <form
        onSubmit={handleSignup}
        className="bg-slate-900 p-8 rounded-2xl w-full max-w-md space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl"
        >
          Signup
        </button>
      </form>
    </div>
  )
}

export default SignupPage