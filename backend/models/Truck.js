const mongoose = require("mongoose");

const TruckSchema = new mongoose.Schema(
  {
    Truck_num: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    Truck_brand: {
      type: String,
      required: true,
      trim: true
    },
    Truck_model: {
      type: String,
      required: true,
      trim: true
    },
    Manufacturing_year: {
      type: Number,
      required: true
    },
    Owner_name: {
      type: String,
      required: true,
      trim: true
    },
    Milage: {
      type: Number,
      required: true
    },
    Driver_name: {
      type: String,
      required: true,
      trim: true
    },
    DOB: {
      type: String,
      required: true
    },
    License_num: {
      type: String,
      required: true,
      trim: true
    },
    License_expiry: {
      type: Date,
      required: true
    },
    Truck_type: {
      type: String,
      default: "Multi-Axle"
    },
    Fuel_type: {
      type: String,
      default: "Diesel"
    },
    Load_capacity: {
      type: Number,
      default: 25
    },
    Contact_num: {
      type: String,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    // TrackX Maintenance & Odometer Metrics
    totalOdometerKm: {
      type: Number,
      default: 24000
    },
    kmSinceLastService: {
      type: Number,
      default: 1084 // Starts with sample run or 0
    },
    serviceDueAlert: {
      type: Boolean,
      default: false
    },
    lastServiceDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "ON_TRIP", "MAINTENANCE"],
      default: "AVAILABLE"
    }
  },
  { timestamps: true }
);

// Method: Update distance and trigger 10,000 km alert
TruckSchema.methods.addTripDistance = async function (tripKm) {
  this.totalOdometerKm += tripKm;
  this.kmSinceLastService += tripKm;

  if (this.kmSinceLastService >= 10000) {
    this.serviceDueAlert = true;
  }

  return await this.save();
};

// Method: Reset service counter
TruckSchema.methods.resetService = async function () {
  this.kmSinceLastService = 0;
  this.serviceDueAlert = false;
  this.lastServiceDate = new Date();
  return await this.save();
};

module.exports = mongoose.models.New_truck || mongoose.model("New_truck", TruckSchema);
