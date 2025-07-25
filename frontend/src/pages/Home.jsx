import { useTheme } from "../context/ThemeContext";
import communicationImage from "../assets/communication.svg";

const Home = () => {
  const { theme } = useTheme();

  return (
    <main
      className={`flex items-center justify-center min-h-screen px-4 transition-colors duration-300 
        ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
            : "bg-gradient-to-br from-blue-100 via-purple-100 to-white text-gray-900"
        }`}
    >
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-10 bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-lg">
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <img
            src={communicationImage}
            alt="Communication"
            className="w-full max-h-80 object-contain"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Omni-Channel Communication
          </h1>
          <p className="text-lg">
            Connect via <strong>Chat</strong>, <strong>Email</strong>,{" "}
            <strong>SMS</strong>, and <strong>Voice</strong> — all in one
            seamless platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <a
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-base font-medium"
            >
              Login
            </a>
            <a
              href="/register"
              className={`px-6 py-3 rounded-lg shadow transition-colors text-base font-medium 
                ${
                  theme === "dark"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
