const { loadEnv } = require("./config/loadEnv");
loadEnv();


const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");



const authRoutes = require("./routes/authRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const exhibitionRoutes = require("./routes/exhibitionRoutes");
const faqRoutes = require("./routes/faqRoutes");
const eventRoutes = require("./routes/eventRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { initializeChatSocket } = require("./services/chatSocketService");
const {
  initializeDatabase,
  testDatabaseConnection,
} = require("./config/database");
const { getDatabaseProfile } = require("./config/databaseName");
const { cleanupVerificationCodes } = require("./models/verificationCodeModel");
const { seedDefaultEventIfEmpty } = require("./models/eventModel");
const { seedDefaultBadgesIfEmpty } = require("./models/badgeModel");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_API_BASE_URL =
  process.env.PUBLIC_API_BASE_URL || `http://localhost:${PORT}`;
const VERIFICATION_CODE_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;
const uploadsPath = path.resolve(__dirname, "../uploads");

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/**
 * Middleware
 * - CORS lets your frontend call this backend from web during development.
 * - express.json() reads JSON request bodies.
 */
app.use(
  cors({
    origin(origin, callback) {
      // Allow mobile apps, curl, Postman, same-origin, etc. which may not send Origin.
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost for development
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }

      // Allow configured origins for production
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
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
app.use("/exhibitions", exhibitionRoutes);
app.use("/events", eventRoutes);
app.use("/badges", badgeRoutes);
app.use("/chat", chatRoutes);
app.use("/", faqRoutes);

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

    const seededEvent = await seedDefaultEventIfEmpty();
    if (seededEvent) {
      console.log("Seeded default home screen event");
    }

    const seededBadges = await seedDefaultBadgesIfEmpty();
    if (seededBadges) {
      console.log("Seeded default badge registrations");
    }

    await testDatabaseConnection();
    console.log("Database connected successfully");
  } catch (error) {
    const detail =
      error.sqlMessage || error.message || error.code || String(error);
    console.error("Database connection failed:", detail);
    if (error.code === "ER_ACCESS_DENIED_ERROR" || error.errno === 1045) {
      console.error(
        [
          `Active DB profile: ${getDatabaseProfile()} (set DB_PROFILE=local for local MySQL, or production for prod).`,
          "MySQL ER_ACCESS_DENIED usually means one of:",
          "  1) Wrong DB_PROD_USER / DB_PROD_PASSWORD / DB_PROD_NAME — copy exactly from your host panel.",
          "  2) Remote connections blocked — in hPanel: Databases → Remote MySQL → add the IP shown after @'…' in the error (your server’s or your home’s public IP, not 192.168.x.x).",
          "  3) Try DB_PROD_SSL=true on the server; if it still fails, DB_PROD_SSL=insecure (TLS only; use only if your host requires it).",
        ].join("\n")
      );
    }

    if (process.env.START_WITHOUT_DB === "true") {
      console.warn("Continuing without database (START_WITHOUT_DB=true). APIs that use MySQL will fail.");
    } else {
      process.exit(1);
    }
  }

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  app.set("io", io);
  initializeChatSocket(io);

  server.listen(PORT, () => {
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
