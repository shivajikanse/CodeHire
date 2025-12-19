import Session from "../models/Sessioon.model.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user.id;

    if (!problem || !difficulty) {
      return res
        .status(400)
        .json({ message: "Problem and difficulty are required" });
    }

    // Generate unique callId used for Socket.IO/WebRTC room
    const callId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    // Save to DB
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
      status: "active",
      participants: [userId], // host is first participant
    });

    return res.status(201).json({ ok: true, session });
  } catch (error) {
    console.log("createSession error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//  Get all active sessions

export async function getActiveSessions(req, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name email image")
      .populate("participants", "name email image")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ ok: true, sessions });
  } catch (error) {
    console.log("getActiveSessions error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get recently completed sessions of logged-in user
 */
export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user.id;

    const sessions = await Session.find({
      status: "completed",
      participants: userId,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ ok: true, sessions });
  } catch (error) {
    console.log("getMyRecentSessions error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get session details by session ID
 */
export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email ")
      .populate("participants", "name email ");

    if (!session) return res.status(404).json({ message: "Session not found" });

    return res.status(200).json({ ok: true, session });
  } catch (error) {
    console.log("getSessionById error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Join a session (max 2 participants)
 */
export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Session is not active" });
    }

    if (session.host.toString() === userId) {
      return res
        .status(400)
        .json({ message: "Host cannot join as participant" });
    }

    // Room locking logic — only 2 people allowed
    if (session.participants.length >= 2) {
      return res.status(409).json({ message: "Session is full" });
    }

    // Add participant if not already in list
    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
      await session.save();
    }

    return res.status(200).json({ ok: true, session });
  } catch (error) {
    console.log("joinSession error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * End a session — only host can end it
 */
export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId) {
      return res.status(403).json({ message: "Only host can end the session" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session already completed" });
    }

    session.status = "completed";
    await session.save();

    return res.status(200).json({
      ok: true,
      message: "Session ended successfully",
      session,
    });
  } catch (error) {
    console.log("endSession error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
