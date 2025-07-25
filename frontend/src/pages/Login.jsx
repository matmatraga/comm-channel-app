import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, LogIn, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
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
      const res = await axios.post(
        "https://omni-channel-app.onrender.com/api/auth/login",
        { email, password }
      );
      login(res.data.token);
      toast.success("✅ Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${
        theme === "dark"
          ? "from-gray-900 via-gray-800 to-black text-white"
          : "from-blue-50 via-purple-100 to-white text-gray-900"
      } flex items-center justify-center px-4`}
    >
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-lg">
        <div className="flex items-center justify-center gap-3">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Sign in to OmniComm
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
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
            <label className="text-sm font-medium">Password</label>
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
