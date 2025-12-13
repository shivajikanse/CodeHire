import express from "express";
import verifyJwt from "../middleware/verifyJwt.js";

import {
  createSession,
  getActiveSessions,
  getSessionById,
  joinSession,
  endSession,
  getMyRecentSessions,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", verifyJwt, createSession);

// STATIC ROUTES (must come first)
router.get("/active", verifyJwt, getActiveSessions);
router.get("/my-recent", verifyJwt, getMyRecentSessions);

// DYNAMIC ROUTES (must come last)
router.get("/:id", verifyJwt, getSessionById);
router.post("/:id/join", verifyJwt, joinSession);
router.post("/:id/end", verifyJwt, endSession);

export default router;
