import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password });
      navigate("/");
    } catch (err) {
      setError(extractErrorMessage(err, "Could not create your account."));
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
        <p className="text-sm text-ink-soft mb-6">Start your ledger.</p>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-line rounded-lg p-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
            />
          </label>

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
              minLength={8}
              className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
            />
            <span className="text-xs text-ink-soft/70">
              At least 8 characters.
            </span>
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
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ink-soft mt-4 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-teal hover:text-teal-dark font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
