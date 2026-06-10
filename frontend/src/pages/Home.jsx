import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  MessageCircle,
  Video,
  CheckCheck,
  Mail,
  Shield,
} from "lucide-react";

import { DEMO_USERS, DEMO_PASSWORD } from "../lib/demoCredentials";

const demoUrl = import.meta.env.VITE_DEMO_URL;

const features = [
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    desc: "Messenger-style UI with typing indicators, presence, and read receipts",
  },
  {
    icon: Video,
    title: "In-App Calls",
    desc: "Peer-to-peer audio and video via WebRTC — no third-party iframe required",
  },
  {
    icon: CheckCheck,
    title: "Delivery Status",
    desc: "Optimistic sends with delivered and seen confirmations",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    desc: "JWT-protected REST and Socket.IO connections",
  },
  {
    icon: Mail,
    title: "Email Demo",
    desc: "Nodemailer send and IMAP inbox integration",
  },
];

const stack = ["React", "Node.js", "Socket.IO", "WebRTC", "MongoDB"];

const Home = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <main
      className={`min-h-[calc(100vh-4rem)] px-4 py-12 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-white text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-16">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Real-time messenger with{" "}
            <span className="text-blue-600">WebRTC</span> calls
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A full-stack communication platform demonstrating production patterns:
            JWT socket auth, in-app WebRTC calls, read receipts, and real-time
            presence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={isAuthenticated ? "/chat" : "/login"}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 font-medium transition"
            >
              {isAuthenticated ? "Open Chat" : "Try Demo"}
            </Link>
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 font-medium transition text-center"
              >
                Live Demo
              </a>
            )}
            <Link
              to="/register"
              className={`px-8 py-3 rounded-lg shadow font-medium transition ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-white hover:bg-gray-50 border"
              }`}
            >
              Create Account
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="max-w-lg mx-auto rounded-xl border dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 p-4 text-left text-sm space-y-2">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                Demo accounts (use in two browser tabs)
              </p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                {DEMO_USERS.map((u) => (
                  <li key={u.email}>
                    <span className="font-mono text-xs">{u.email}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Password:{" "}
                <code className="font-mono text-gray-700 dark:text-gray-300">
                  {DEMO_PASSWORD}
                </code>
              </p>
            </div>
          )}
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc }) => {
            const Icon = icon;
            return (
              <div
                key={title}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl p-6 shadow-lg border dark:border-gray-700"
              >
                <Icon className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            );
          })}
        </section>

        <section className="text-center">
          <p className="text-sm text-gray-500 mb-3">Built with</p>
          <div className="flex flex-wrap justify-center gap-2">
            {stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
