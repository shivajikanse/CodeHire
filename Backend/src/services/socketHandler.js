import { Server } from "socket.io";
import * as jwtUtils from "../utils/jwt.js";
import User from "../models/User.model.js";
import Room from "../models/Sessioon.model.js";
import { ENV } from "../lib/env.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ENV.APP_BASE_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || "";
      const token = raw.replace("Bearer ", "").trim();
      if (!token) return next(new Error("Unauthorized: no token"));

      const payload = jwtUtils.verifyAccessToken(token);
      const user = await User.findById(payload.userId).select(
        "-passwordHash -refreshTokenHash"
      );
      if (!user) return next(new Error("Unauthorized: user not found"));

      socket.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };
      return next();
    } catch (err) {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id, "user", socket.user?.email);

    socket.on("room:create", async (payload, cb) => {
      try {
        let code = (
          payload?.code ||
          Math.random().toString(36).substring(2, 8).toUpperCase()
        ).slice(0, 12);
        const locked = !!payload?.locked;
        const maxParticipants = payload?.maxParticipants || 2;

        let existing = await Room.findOne({ code });
        while (existing) {
          code = Math.random().toString(36).substring(2, 8).toUpperCase();
          existing = await Room.findOne({ code });
        }

        const room = new Room({
          code,
          participants: [socket.user.id],
          locked,
          maxParticipants,
        });
        await room.save();

        socket.join(code);
        cb?.({ ok: true, room: { code: room.code, locked: room.locked } });
      } catch (err) {
        console.error(err);
        cb?.({ ok: false, error: "Failed to create room" });
      }
    });

    socket.on("room:join", async (payload, cb) => {
      try {
        const code = payload?.code;
        if (!code) return cb?.({ ok: false, error: "Room code required" });

        const room = await Room.findOne({ code });
        if (!room) return cb?.({ ok: false, error: "Room not found" });

        const participantCount = room.participants.length;
        if (room.locked && participantCount >= room.maxParticipants) {
          return cb?.({ ok: false, error: "Room is full/locked" });
        }

        const already = room.participants.find(
          (p) => p.toString() === socket.user.id
        );
        if (!already) {
          room.participants.push(socket.user.id);
          await room.save();
        }

        socket.join(code);
        const participants = await User.find({
          _id: { $in: room.participants },
        }).select("name email");
        io.to(code).emit("room:members", { participants });

        cb?.({
          ok: true,
          room: { code: room.code, locked: room.locked },
          participants,
        });
      } catch (err) {
        console.error(err);
        cb?.({ ok: false, error: "Failed to join room" });
      }
    });

    socket.on("room:leave", async (payload, cb) => {
      try {
        const code = payload?.code;
        if (!code) return cb?.({ ok: false, error: "Room code required" });

        const room = await Room.findOne({ code });
        if (!room) return cb?.({ ok: false, error: "Room not found" });

        room.participants = room.participants.filter(
          (p) => p.toString() !== socket.user.id
        );
        await room.save();

        socket.leave(code);
        const participants = await User.find({
          _id: { $in: room.participants },
        }).select("name email");
        io.to(code).emit("room:members", { participants });

        cb?.({ ok: true });
      } catch (err) {
        console.error(err);
        cb?.({ ok: false, error: "Failed to leave room" });
      }
    });

    socket.on("signal", (payload) => {
      const to = payload?.to;
      const data = payload?.data;
      if (to) io.to(to).emit("signal", { from: socket.id, data });
    });

    socket.on("disconnecting", async () => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const code of rooms) {
        try {
          const room = await Room.findOne({ code });
          if (!room) continue;
          room.participants = room.participants.filter(
            (p) => p.toString() !== socket.user.id
          );
          await room.save();
          io.to(code).emit("room:members", {
            participants: await User.find({
              _id: { $in: room.participants },
            }).select("name email"),
          });
        } catch (err) {
          // ignore
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
    });
  });
}
