const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["DRIVER", "TRUCK", "JOURNEY"],
      required: true
    },
    docType: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    documentNumber: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String,
      default: "https://placehold.co/600x400/png?text=Document+Proof"
    },
    expiryDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ["VERIFIED", "PENDING", "REJECTED"],
      default: "VERIFIED"
    },
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "New_truck"
    },
    truckNumber: {
      type: String
    },
    driverName: {
      type: String
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
