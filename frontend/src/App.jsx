import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Logout from "./pages/Logout";
import GoogleLogin from "./pages/GoogleLogin";
import Email from "./pages/Email";
import ChatBox from "./pages/ChatBox";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { CallProvider } from "./context/CallContext";
import CallManager from "./components/chat/CallManager";
import ConnectionBanner from "./components/ConnectionBanner";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <CallProvider>
            <Router>
              <Navbar />
              <ConnectionBanner />
              <CallManager />
              <Toaster position="bottom-right" reverseOrder={false} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatBox />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/email"
                  element={
                    <ProtectedRoute>
                      <Email />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google-login" element={<GoogleLogin />} />
                <Route path="/logout" element={<Logout />} />
              </Routes>
            </Router>
          </CallProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
