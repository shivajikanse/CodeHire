import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";

const accessSecret = ENV.JWT_ACCESS_TOKEN_SECRET;
const refreshSecret = ENV.JWT_REFRESH_TOKEN_SECRET;
const accessExpiry = ENV.ACCESS_TOKEN_EXPIRY || "15m";
const refreshExpiry = ENV.REFRESH_TOKEN_EXPIRY || "7d";

export function signAccessToken(payload) {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiry });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiry });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret);
}
