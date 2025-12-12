import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, index: true, unique: true, required: true },
  name: { type: String },
  passwordHash: { type: String, required: true },
  refreshTokenHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
