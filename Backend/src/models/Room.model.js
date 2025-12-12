import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  code: { type: String, index: true, unique: true, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  locked: { type: Boolean, default: false },
  maxParticipants: { type: Number, default: 2 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Room", roomSchema);
