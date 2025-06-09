import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the token from localStorage (or sessionStorage if used)
    localStorage.removeItem('token');

    // Optionally, clear other stored user data if any
    // localStorage.removeItem('user');

    // Redirect to login page or homepage
    navigate('/login');
  }, [navigate]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;