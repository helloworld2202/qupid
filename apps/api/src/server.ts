import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import pino from "pino"
import { pinoHttp } from "pino-http"
import { env } from "./shared/config/env.js"
import { errorHandler } from "./shared/middleware/errorHandler.js"

// Import routes
import authRoutes from "./modules/auth/routes.js"
import chatRoutes from "./modules/chat/routes.js"
import stylingRoutes from "./modules/styling/routes.js"
import personaRoutes from "./modules/persona/routes.js"
import notificationRoutes from "./modules/notification/routes.js"
import coachingRoutes from "./modules/coaching/routes.js"
import userRoutes from "./modules/user/routes.js"
import badgeRoutes from "./modules/badge/routes.js"
import analyticsRoutes from "./modules/analytics/routes.js"

const logger = env.NODE_ENV === "production" 
  ? pino({
      level: "info"
    })
  : pino({
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true
        }
      }
    })

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in the allowed list
      if (env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        // In production, reject unknown origins
        if (env.NODE_ENV === 'production') {
          callback(new Error('Not allowed by CORS'));
        } else {
          // In development, be more permissive
          callback(null, true);
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// Rate limiting (개발 환경에서는 비활성화)
if (env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: "Too many requests from this IP, please try again later."
  })
  app.use("/api/", limiter)
}

// Logging
app.use(pinoHttp({ logger }))

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check endpoints
app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy" })
})

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, status: "healthy" })
})

// API routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/chat", chatRoutes)
app.use("/api/v1/styling", stylingRoutes)
app.use("/api/v1/personas", personaRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/coaches", coachingRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1", badgeRoutes)
app.use("/api/v1/analytics", analyticsRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found"
    }
  })
})

// Error handler (must be last)
app.use(errorHandler)

// Start server
const PORT = env.PORT || 4000

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Environment: ${env.NODE_ENV}`)
  logger.info(`Allowed origins: ${env.ALLOWED_ORIGINS.join(", ")}`)
})
