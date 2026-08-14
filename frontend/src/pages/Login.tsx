import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(
        extractErrorMessage(err, "Could not sign in. Check your details."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl text-ink mb-1">
          FinTrack
        </h1>
        <p className="text-sm text-ink-soft mb-6">Sign in to your ledger.</p>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-line rounded-lg p-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
            />
          </label>

          {error && (
            <p className="text-brick text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-teal hover:bg-teal-dark disabled:opacity-50 text-white font-medium rounded-md px-4 py-2 transition-colors"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-ink-soft mt-4 text-center">
          New here?{" "}
          <Link
            to="/register"
            className="text-teal hover:text-teal-dark font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
