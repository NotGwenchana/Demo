const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  membershipID: { type: String, required: true, unique: true },
  memberPoints: { type: Number, default: 100 },
  cart: { type: Array, default: [] },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;

