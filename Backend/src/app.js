import "dotenv/config";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import { initSocket } from "./services/socketHandler.js";
import verifyJwt from "./middleware/verifyJwt.js";
import { ENV } from "./lib/env.js";

import SessionRoute from "./routes/SessionRoute.js";
import chatRoute from "./routes/chatRoute.js";

const app = express();
const server = http.createServer(app);

//midddlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ENV.APP_BASE_URL || "http://localhost:5173",
    credentials: true,
  })
);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests, try again later" },
});

//Routes :--
app.use("/api/auth", authLimiter, authRoutes);

app.get("/api/auth/me", verifyJwt, (req, res) => {
  res.json({ ok: true, user: req.user });
});

app.use("/api/chat", chatRoute);
app.use("/api/Sessions", SessionRoute);

async function start() {
  const port = ENV.PORT || 5000;
  await mongoose.connect(ENV.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected");

  initSocket(server);

  server.listen(port, () => console.log(`Server listening on ${port}`));
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
