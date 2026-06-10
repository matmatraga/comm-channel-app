import React, { useState } from "react";
import api from "../lib/api";
import { Mail, Lock, LogIn, ShieldCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { DEMO_USERS } from "../lib/demoCredentials";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", { email, password });
      login(res.data.token);
      toast.success("Login successful!");
      navigate("/chat");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${baseUrl}/api/auth/google`;
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${
        theme === "dark"
          ? "from-gray-900 via-gray-800 to-black text-white"
          : "from-blue-50 via-purple-100 to-white text-gray-900"
      } flex items-center justify-center px-4 py-8`}
    >
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-lg">
        <div className="flex items-center justify-center gap-3">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Sign in to OmniComm
          </h2>
        </div>

        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-3 space-y-2">
          <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
            Try the demo — open two tabs with different accounts to test chat and
            calls
          </p>
          <div className="flex flex-col gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => fillDemo(demo)}
                className="flex items-center gap-2 text-left text-xs px-3 py-2 rounded-md bg-white dark:bg-gray-800 border dark:border-gray-600 hover:border-blue-400 transition"
              >
                <User className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-200">
                  {demo.label}{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    ({demo.email})
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Password: <code className="font-mono">Demo1234!</code>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="flex items-center mt-1 border rounded-lg px-3 py-2 focus-within:ring-2 ring-blue-400 dark:border-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ml-3 w-full outline-none bg-transparent text-sm placeholder-gray-400 dark:text-white"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="flex items-center mt-1 border rounded-lg px-3 py-2 focus-within:ring-2 ring-blue-400 dark:border-gray-600">
              <Lock className="h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="ml-3 w-full outline-none bg-transparent text-sm placeholder-gray-400 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow transition disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-300">
          <span>Or</span>
          <button
            onClick={handleGoogleLogin}
            className="underline hover:text-blue-700 dark:hover:text-blue-400"
          >
            login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
