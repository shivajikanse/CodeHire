import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.model.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const router = express.Router();

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ name, email: email.toLowerCase(), passwordHash });
    await user.save();

    const accessToken = signAccessToken({
      userId: user._id,
      email: user.email,
    });
    const refreshToken = signRefreshToken({ userId: user._id });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      ok: true,
      accessToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken({
      userId: user._id,
      email: user.email,
    });
    const refreshToken = signRefreshToken({ userId: user._id });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      ok: true,
      accessToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);
    if (!user)
      return res
        .status(401)
        .json({ error: "Invalid refresh token (user missing)" });

    const valid = await bcrypt.compare(token, user.refreshTokenHash || "");
    if (!valid) return res.status(401).json({ error: "Invalid refresh token" });

    const newRefresh = signRefreshToken({ userId: user._id });
    const newRefreshHash = await bcrypt.hash(newRefresh, 12);
    user.refreshTokenHash = newRefreshHash;
    await user.save();

    const accessToken = signAccessToken({
      userId: user._id,
      email: user.email,
    });
    setRefreshCookie(res, newRefresh);

    res.json({ ok: true, accessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        const user = await User.findById(payload.userId);
        if (user) {
          user.refreshTokenHash = undefined;
          await user.save();
        }
      } catch (e) {
        // ignore
      }
    }
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
