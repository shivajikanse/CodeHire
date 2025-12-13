import express from "express";
import { getStreamToken } from "../controllers/chatController.js";
import verifyJwt from "../middleware/verifyJwt.js";

const router = express.Router();

router.get("/token", verifyJwt, getStreamToken);

export default router;
