import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const ConnectionBanner = () => {
  const { isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();

  if (!isAuthenticated || !socket || isConnected) return null;

  return (
    <div
      role="status"
      className="fixed top-16 inset-x-0 z-40 bg-amber-500 text-amber-950 text-center text-sm py-1.5 px-4 shadow"
    >
      Connection lost — reconnecting…
    </div>
  );
};

export default ConnectionBanner;
