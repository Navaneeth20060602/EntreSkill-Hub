import "./LoginForm.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const loggedInUser = await login({ email, password });

      if (loggedInUser.role === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
        return;
      }
      if (loggedInUser.role === "MENTOR") {
        navigate("/mentor-dashboard", { replace: true });
        return;
      }

      const hasPrimarySkill = Boolean(localStorage.getItem("primarySkill"));
      navigate(hasPrimarySkill ? "/dashboard" : "/skill-assessment", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login">
      <div className="login-box">

        <h2>Welcome Back</h2>

        <p>
          Login to continue your entrepreneurial journey.
        </p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>

        </form>

        <GoogleSignInButton />

        <p className="login-forgot-link">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>

      </div>
    </section>
  );
}

export default LoginForm;
