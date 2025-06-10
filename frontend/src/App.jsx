import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Logout from './pages/Logout';
import Email from './pages/Email';

function App() {

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
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
