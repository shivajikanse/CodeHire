import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.model.js";

export default async function verifyJwt(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const tokenFromHeader = authHeader.replace("Bearer ", "").trim();
    const token = tokenFromHeader || req.cookies?.accessToken;

    if (!token) return res.status(401).json({ error: "No access token" });

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select(
      "-passwordHash -refreshTokenHash"
    );
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
