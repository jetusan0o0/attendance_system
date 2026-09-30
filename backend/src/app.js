import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const app = express();

// Comprehensive CORS configuration for local development
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any local origin (e.g., localhost:5173, localhost:5174, etc.) or same-origin
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;