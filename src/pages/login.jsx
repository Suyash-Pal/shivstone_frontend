import { useState } from "react"
import { supabase } from "../lib/supabase"
import { FiUser, FiLock } from "react-icons/fi"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } 

    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Hello, Namaste !!</h1>
        <p className="login-subtitle">Enter your credentials to access the dashboard</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          &copy; SkylineERP - All rights reserved.
        </p>
      </div>
    </div>
  )
}
