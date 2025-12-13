import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const streamUserId = req.user.id; // from verifyjwt middleware
    // Create token for Stream Chat user
    const token = chatClient.createToken(streamUserId);

    res.status(200).json({
      ok: true,
      token,
      userId: streamUserId,
      userName: req.user.name,
    });
  } catch (error) {
    console.log("Error in getStreamToken:", error.message);
    res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
