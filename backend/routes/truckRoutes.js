const express = require("express");
const router = express.Router();
const Truck = require("../models/Truck");
const auth = require("../Middleware/Auth");

// 1. GET ALL TRUCKS FOR LOGGED IN USER
router.get("/", auth, async (req, res) => {
  try {
    let trucks;
    if (req.user && req.user.role === "driver") {
      trucks = await Truck.find({}).sort({ createdAt: -1 });
    } else {
      trucks = await Truck.find({ owner: req.user.userId }).sort({ createdAt: -1 });
      if (trucks.length === 0) {
        trucks = await Truck.find({}).sort({ createdAt: -1 });
      }
    }
    return res.status(200).json({
      totalTrucks: trucks.length,
      trucks
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch trucks", error: error.message });
  }
});

// 2. RESET 10,000 KM MAINTENANCE SERVICE COUNTER
router.put("/:truckNumber/reset-service", auth, async (req, res) => {
  try {
    const { truckNumber } = req.params;
    const truck = await Truck.findOne({ Truck_num: truckNumber.toUpperCase().trim() });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    await truck.resetService();

    return res.status(200).json({
      message: `Truck ${truck.Truck_num} service logged! 10,000 km maintenance counter reset to 0 km.`,
      truck
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reset service", error: error.message });
  }
});

// 3. GET TRUCKS WITH ACTIVE MAINTENANCE ALERTS
router.get("/maintenance-alerts", auth, async (req, res) => {
  try {
    const alerts = await Truck.find({
      $or: [{ serviceDueAlert: true }, { kmSinceLastService: { $gte: 10000 } }]
    });

    return res.status(200).json({
      alertCount: alerts.length,
      trucks: alerts
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch maintenance alerts", error: error.message });
  }
});

// 4. DELETE A TRUCK FROM FLEET (Owner Only)
router.delete("/:truckNumber", auth, async (req, res) => {
  try {
    if (req.user && req.user.role === "driver") {
      return res.status(403).json({
        message: "Access forbidden: Only Fleet Owners have permission to delete trucks from the fleet."
      });
    }

    const { truckNumber } = req.params;
    const deletedTruck = await Truck.findOneAndDelete({
      Truck_num: truckNumber.toUpperCase().trim()
    });

    if (!deletedTruck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    return res.status(200).json({
      message: `Truck ${deletedTruck.Truck_num} successfully removed from fleet.`,
      truckNumber: deletedTruck.Truck_num
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete truck", error: error.message });
  }
});

module.exports = router;
