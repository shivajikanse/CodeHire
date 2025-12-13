import mongoose from "mongoose";

const Sessionschema = new mongoose.Schema(
  {
    problem: {
      type: String,
      index: true,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      //  required: true
    },

    locked: {
      type: Boolean,
      default: false,
    },

    maxParticipants: {
      type: Number,
      default: 4,
    },

    callId: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timeStamps: true }
);

export default mongoose.model("Session", Sessionschema);
