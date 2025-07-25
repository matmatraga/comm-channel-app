import React, { useState } from "react";
import axios from "axios";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "https://omni-channel-app.onrender.com/api/auth/register",
        { name, email, password }
      );
      localStorage.setItem("token", res.data.token);
      toast.success("🎉 Registration successful!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 
        ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
            : "bg-gradient-to-br from-blue-100 via-purple-100 to-white text-gray-900"
        }`}
    >
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-lg">
        <div className="flex items-center justify-center gap-3">
          <UserPlus className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold">Create your OmniComm account</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <div
              className="flex items-center mt-1 rounded-lg px-3 py-2 focus-within:ring-2 ring-blue-400 
              bg-white dark:bg-gray-700 
              border border-gray-300 dark:border-gray-600"
            >
              <User className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="ml-3 w-full outline-none bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <div
              className="flex items-center mt-1 rounded-lg px-3 py-2 focus-within:ring-2 ring-blue-400 
              bg-white dark:bg-gray-700 
              border border-gray-300 dark:border-gray-600"
            >
              <Mail className="h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ml-3 w-full outline-none bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <div
              className="flex items-center mt-1 rounded-lg px-3 py-2 focus-within:ring-2 ring-blue-400 
              bg-white dark:bg-gray-700 
              border border-gray-300 dark:border-gray-600"
            >
              <Lock className="h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="ml-3 w-full outline-none bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow transition disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
