const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema(
  {
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "New_truck"
    },
    truckNumber: {
      type: String,
      required: true
    },
    driverName: {
      type: String,
      default: "Assigned Driver"
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    origin: {
      name: { type: String, required: true },
      coords: { type: [Number], default: [28.6139, 77.209] } // [lat, lng]
    },
    destination: {
      name: { type: String, required: true },
      coords: { type: [Number], default: [26.4499, 80.3319] }
    },
    status: {
      type: String,
      enum: ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PLANNED"
    },
    // Estimates
    plannedDistanceKm: {
      type: Number,
      required: true
    },
    standardMileage: {
      type: Number,
      default: 4.0
    },
    expectedFuelLiters: {
      type: Number,
      required: true
    },
    fuelPricePerLiter: {
      type: Number,
      default: 90.0
    },
    expectedCost: {
      type: Number,
      default: 0
    },
    // Journey Expenses (Fuel, Toll Tax, Food, Water, Total)
    expenses: {
      fuelCost: { type: Number, default: 0 },
      tollTax: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
      totalExpense: { type: Number, default: 0 }
    },
    // Actual Journey Records
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    startOdometer: {
      type: Number
    },
    endOdometer: {
      type: Number
    },
    actualDistanceKm: {
      type: Number,
      default: 0
    },
    actualFuelUsedLiters: {
      type: Number,
      default: 0
    },
    actualMileage: {
      type: Number,
      default: 0
    },
    // Petrol Chori (Fuel Theft) Audit
    fuelDiscrepancyLiters: {
      type: Number,
      default: 0
    },
    petrolChoriAlert: {
      type: Boolean,
      default: false
    },
    alertReason: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", TripSchema);
