const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Truck = require("../models/Truck");
const auth = require("../Middleware/Auth");

// 1. START TRIP
router.post("/start", auth, async (req, res) => {
  try {
    const {
      truckNumber,
      driverName,
      origin,
      destination,
      plannedDistanceKm,
      standardMileage,
      startOdometer
    } = req.body;

    if (!truckNumber || !origin || !destination) {
      return res.status(400).json({ message: "Origin, destination, and truck number are required" });
    }

    const mileage = parseFloat(standardMileage) || 4.0;
    const distance = parseFloat(plannedDistanceKm) || 440;
    const expectedFuel = Number((distance / mileage).toFixed(1));
    const expectedCost = Math.round(expectedFuel * 90);

    const tollTax = parseFloat(req.body.tollTax) || (req.body.expenses && parseFloat(req.body.expenses.tollTax)) || 0;
    const food = parseFloat(req.body.food) || (req.body.expenses && parseFloat(req.body.expenses.food)) || 0;
    const water = parseFloat(req.body.water) || (req.body.expenses && parseFloat(req.body.expenses.water)) || 0;
    const other = parseFloat(req.body.other) || (req.body.expenses && parseFloat(req.body.expenses.other)) || 0;
    const totalExpense = expectedCost + tollTax + food + water + other;

    // Find linked truck if exists
    const existingTruck = await Truck.findOne({ Truck_num: truckNumber.toUpperCase().trim() });

    const newTrip = new Trip({
      truckId: existingTruck ? existingTruck._id : null,
      truckNumber: truckNumber.toUpperCase().trim(),
      driverName: driverName || (existingTruck ? existingTruck.Driver_name : "Driver"),
      ownerId: req.user.userId,
      origin: typeof origin === "string" ? { name: origin, coords: [28.6139, 77.209] } : origin,
      destination: typeof destination === "string" ? { name: destination, coords: [26.4499, 80.3319] } : destination,
      status: "IN_PROGRESS",
      plannedDistanceKm: distance,
      standardMileage: mileage,
      expectedFuelLiters: expectedFuel,
      expectedCost,
      expenses: {
        fuelCost: expectedCost,
        tollTax,
        food,
        water,
        other,
        totalExpense
      },
      startTime: new Date(),
      startOdometer: parseFloat(startOdometer) || 24000
    });

    await newTrip.save();

    if (existingTruck) {
      existingTruck.status = "ON_TRIP";
      await existingTruck.save();
    }

    return res.status(201).json({
      message: "Trip started successfully! Live tracking active.",
      trip: newTrip
    });
  } catch (error) {
    console.error("Start Trip error:", error);
    return res.status(500).json({ message: "Failed to start trip", error: error.message });
  }
});

// 2. END TRIP & AUDIT "PETROL CHORI"
router.post("/end", auth, async (req, res) => {
  try {
    const { tripId, truckNumber, endOdometer, actualFuelUsedLiters } = req.body;

    // Find active trip
    let trip;
    if (tripId) {
      trip = await Trip.findById(tripId);
    } else if (truckNumber) {
      trip = await Trip.findOne({
        truckNumber: truckNumber.toUpperCase().trim(),
        status: "IN_PROGRESS"
      }).sort({ createdAt: -1 });
    }

    if (!trip) {
      return res.status(404).json({ message: "No active running trip found to end." });
    }

    const finalOdo = parseFloat(endOdometer) || (trip.startOdometer + trip.plannedDistanceKm);
    const fuelUsed = parseFloat(actualFuelUsedLiters) || trip.expectedFuelLiters;

    const actualDistance = finalOdo - trip.startOdometer;
    const actualMileage = fuelUsed > 0 ? Number((actualDistance / fuelUsed).toFixed(2)) : trip.standardMileage;
    const expectedFuelForActualDist = Number((actualDistance / trip.standardMileage).toFixed(1));
    const discrepancy = Number((fuelUsed - expectedFuelForActualDist).toFixed(1));

    // Petrol Chori Check: If actual fuel consumed is >10% higher than expected
    const isTheftSuspected = discrepancy > expectedFuelForActualDist * 0.1;
    let alertReason = "Fuel consumption within normal operating range.";
    if (isTheftSuspected) {
      alertReason = `Suspected Petrol Chori: ${discrepancy}L excess fuel consumed (+${Math.round(
        (discrepancy / expectedFuelForActualDist) * 100
      )}% higher than standard).`;
    }

    const actualFuelCost = Math.round(fuelUsed * 90);
    const tollTax = req.body.tollTax !== undefined ? parseFloat(req.body.tollTax) : (trip.expenses?.tollTax || 0);
    const food = req.body.food !== undefined ? parseFloat(req.body.food) : (trip.expenses?.food || 0);
    const water = req.body.water !== undefined ? parseFloat(req.body.water) : (trip.expenses?.water || 0);
    const other = req.body.other !== undefined ? parseFloat(req.body.other) : (trip.expenses?.other || 0);
    const totalExpense = actualFuelCost + tollTax + food + water + other;

    trip.expenses = {
      fuelCost: actualFuelCost,
      tollTax,
      food,
      water,
      other,
      totalExpense
    };

    trip.status = "COMPLETED";
    trip.endTime = new Date();
    trip.endOdometer = finalOdo;
    trip.actualDistanceKm = actualDistance;
    trip.actualFuelUsedLiters = fuelUsed;
    trip.actualMileage = actualMileage;
    trip.fuelDiscrepancyLiters = discrepancy;
    trip.petrolChoriAlert = isTheftSuspected;
    trip.alertReason = alertReason;

    await trip.save();

    // Update Truck's cumulative Odometer and 10,000 km Service Tracker!
    let truckAlertTriggered = false;
    let currentKmSinceService = 0;
    const linkedTruck = await Truck.findOne({ Truck_num: trip.truckNumber });
    if (linkedTruck) {
      linkedTruck.status = "AVAILABLE";
      await linkedTruck.addTripDistance(actualDistance);
      truckAlertTriggered = linkedTruck.serviceDueAlert;
      currentKmSinceService = linkedTruck.kmSinceLastService;
    }

    return res.status(200).json({
      message: "Trip completed and audited successfully!",
      trip,
      audit: {
        actualDistance,
        actualMileage,
        expectedFuel: expectedFuelForActualDist,
        actualFuelUsed: fuelUsed,
        discrepancy,
        isTheftSuspected,
        alertReason
      },
      maintenance: {
        kmSinceLastService: currentKmSinceService,
        serviceDueAlert: truckAlertTriggered
      }
    });
  } catch (error) {
    console.error("End Trip error:", error);
    return res.status(500).json({ message: "Failed to end trip", error: error.message });
  }
});

// 3. GET ACTIVE TRIP
router.get("/active", auth, async (req, res) => {
  try {
    const { truckNumber } = req.query;
    const query = { status: "IN_PROGRESS" };
    if (truckNumber) query.truckNumber = truckNumber.toUpperCase().trim();

    const activeTrip = await Trip.findOne(query).sort({ createdAt: -1 });
    return res.status(200).json({ activeTrip });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch active trip", error: error.message });
  }
});

// 4. GET TRIP HISTORY
router.get("/history", auth, async (req, res) => {
  try {
    const { truckNumber } = req.query;
    const query = { status: "COMPLETED" };
    if (truckNumber) query.truckNumber = truckNumber.toUpperCase().trim();

    const trips = await Trip.find(query).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ trips });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch trip history", error: error.message });
  }
});

module.exports = router;
