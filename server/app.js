const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");

const { consoleLogger, fileLogger } = require("./middleware/loggerMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const businessRoutes = require("./routes/businessRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const learningRoutes = require("./routes/learningRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const calculatorRoutes = require("./routes/calculatorRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");
const examRoutes = require("./routes/examRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // uploaded photos/videos are fetched from the client's own origin
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(consoleLogger);
app.use(fileLogger);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "EntreSkill Hub API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/calculator", calculatorRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
