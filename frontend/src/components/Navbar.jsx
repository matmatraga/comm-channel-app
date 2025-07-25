// Navbar.jsx
import React, { useState, useEffect } from "react";
import {
  Home,
  LogIn,
  UserPlus,
  MessageCircle,
  MessageSquare,
  Phone,
  Mail,
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/chat", label: "Chat", icon: MessageCircle },
    { path: "/sms", label: "SMS", icon: MessageSquare },
    { path: "/voice", label: "Voice", icon: Phone },
    { path: "/email", label: "Email", icon: Mail },
  ];

  const authItems = isAuthenticated
    ? [{ path: "/logout", label: "Logout", icon: LogOut }]
    : [
        { path: "/login", label: "Login", icon: LogIn },
        { path: "/register", label: "Register", icon: UserPlus },
      ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
              OmniComm
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map(({ path, label, icon: Icon }) =>
                isAuthenticated || path === "/" ? (
                  <a
                    key={path}
                    href={path}
                    className={`group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out flex items-center space-x-2 ${
                      window.location.pathname === path
                        ? "bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
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

            {/* Auth items */}
            <div className="flex items-center space-x-2">
              {authItems.map(({ path, label, icon: Icon }) => (
                <a
                  key={path}
                  href={path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out flex items-center space-x-2 ${
                    window.location.pathname === path
                      ? "bg-blue-600 text-white shadow-md"
                      : path === "/logout"
                      ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
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

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {navItems.map(({ path, label, icon: Icon }) =>
              isAuthenticated || path === "/" ? (
                <a
                  key={path}
                  href={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ease-in-out flex items-center space-x-3 ${
                    window.location.pathname === path
                      ? "bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </a>
              ) : null
            )}

            <hr className="my-3 border-gray-200 dark:border-gray-700" />

            {authItems.map(({ path, label, icon: Icon }) => (
              <a
                key={path}
                href={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ease-in-out flex items-center space-x-3 ${
                  window.location.pathname === path
                    ? "bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-400"
                    : path === "/logout"
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
