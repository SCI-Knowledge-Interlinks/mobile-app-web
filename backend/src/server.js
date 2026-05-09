const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const {
  initializeDatabase,
  testDatabaseConnection,
} = require("./config/database");
const { cleanupVerificationCodes } = require("./models/verificationCodeModel");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_API_BASE_URL =
  process.env.PUBLIC_API_BASE_URL || `http://localhost:${PORT}`;
const VERIFICATION_CODE_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;
const uploadsPath = path.resolve(__dirname, "../uploads");

/**
 * Middleware
 * - CORS lets your frontend call this backend from web during development.
 * - express.json() reads JSON request bodies.
 */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

/**
 * Health check route
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Prawaas backend is running",
  });
});

/**
 * Auth routes
 */
app.use("/auth", authRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/", sessionRoutes);

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (
    err.code === "LIMIT_FILE_SIZE" ||
    err.message === "Only JPG, PNG, or WEBP images are allowed"
  ) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Profile photo must be 3MB or smaller"
          : err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const startServer = async () => {
  try {
    /**
     * Run one-time database setup before the server starts accepting requests.
     */
    await initializeDatabase();
    console.log("Database and users table are ready");

    await testDatabaseConnection();
    console.log("Database connected successfully");
  } catch (error) {
    console.error(
      "Database connection failed:",
      error.code || error.sqlMessage || error.message || error
    );
  }

  app.listen(PORT, () => {
    console.log(`Backend running on ${PUBLIC_API_BASE_URL}`);
  });

  setInterval(async () => {
    try {
      const deletedRows = await cleanupVerificationCodes();

      if (deletedRows > 0) {
        console.log(`Cleaned ${deletedRows} old verification code(s)`);
      }
    } catch (error) {
      console.error("Verification code cleanup failed:", error.message || error);
    }
  }, VERIFICATION_CODE_CLEANUP_INTERVAL_MS);
};

startServer();
