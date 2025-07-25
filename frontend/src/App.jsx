import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Logout from "./pages/Logout";
import Email from "./pages/Email";
import ChatBox from "./pages/ChatBox";
import SMS from "./pages/SMS";
import Voice from "./pages/Voice";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Navbar />
          <Toaster position="bottom-right" reverseOrder={false} />
          <Routes>
            <Route path="/voice" element={<Voice />} />
            <Route path="/sms" element={<SMS />} />
            <Route path="/chat" element={<ChatBox />} />
            <Route path="/email" element={<Email />} />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
