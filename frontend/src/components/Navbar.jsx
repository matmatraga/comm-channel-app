import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LogIn,
  UserPlus,
  MessageCircle,
  Mail,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home, public: true },
    { path: "/chat", label: "Chat", icon: MessageCircle },
    { path: "/email", label: "Email (Demo)", icon: Mail },
  ];

  const authItems = isAuthenticated
    ? [{ path: "/logout", label: "Logout", icon: LogOut }]
    : [
        { path: "/login", label: "Login", icon: LogIn },
        { path: "/register", label: "Register", icon: UserPlus },
      ];

  const NavLink = ({ path, label, icon, public: isPublic }) => {
    const Icon = icon;
    if (!isAuthenticated && !isPublic) return null;
    const active = location.pathname === path;
    return (
      <Link
        to={path}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`group relative px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
          active
            ? "bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow-sm"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
              OmniComm
            </span>
          </Link>

          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink key={item.path} {...item} />
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              {authItems.map(({ path, label, icon }) => {
                const Icon = icon;
                return (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
                    path === "/logout"
                      ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );})}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-lg px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.path} {...item} />
          ))}
          <hr className="my-3 border-gray-200 dark:border-gray-700" />
          {authItems.map(({ path, label, icon }) => {
            const Icon = icon;
            return (
            <Link
              key={path}
              to={path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-base font-medium flex items-center space-x-3 text-gray-600 dark:text-gray-300"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );})}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
