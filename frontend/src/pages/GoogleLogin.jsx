import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const GoogleLogin = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      login(token);
      toast.success("Google login successful!");
      navigate("/chat");
    } else {
      navigate("/login");
    }
  }, [params, login, navigate]);

  return <p className="text-center mt-20">Completing Google login...</p>;
};

export default GoogleLogin;
