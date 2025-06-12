import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Logout from './pages/Logout';
import Email from './pages/Email';
import ChatBox from './pages/ChatBox';
import SMS from './pages/SMS';

function App() {

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/chatbox"
            element={<ChatBox />}
          />
          <Route path="/sms" element={<SMS />} />
          <Route path="/chatbox" element={<ChatBox />} />
          <Route path="/email" element={<Email />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
