const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      required: true,
      trim: true
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    Password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["owner", "driver", "owner-operator"],
      default: "owner"
    },
    phone: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
