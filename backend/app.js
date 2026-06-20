const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const setupSocket = require("./middlewares/io");
const { seedDemoUsers } = require("./utils/seedDemoUsers");
const {
  getAllowedOrigins,
  createCorsOriginHandler,
  logCorsStartup,
} = require("./utils/corsOrigins");

dotenv.config();
require("./config/passport");

const app = express();
const server = http.createServer(app);

const allowedOrigins = getAllowedOrigins();
const corsOrigin = createCorsOriginHandler(allowedOrigins);
logCorsStartup(allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.set("io", io);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads/chat", express.static(path.join(__dirname, "uploads/chat")));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "omnicomm-api" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/emails", require("./routes/emailRoutes"));
app.use("/api/attachments", require("./routes/attachmentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/calls", require("./routes/callRoutes"));

setupSocket(io);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await seedDemoUsers();
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
