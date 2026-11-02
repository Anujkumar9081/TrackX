const express = require("express");
const router = express.Router();
const auth = require("../Middleware/Auth");

// GET NEARBY HIGHWAY AMENITIES (Petrol Pumps & Dhabas)
router.get("/nearby", auth, async (req, res) => {
  try {
    const { type } = req.query; // 'fuel', 'dhaba', or 'all'

    const petrolPumps = [
      {
        id: "p1",
        name: "Indian Oil Highway Care",
        coords: [28.38, 77.4],
        dist: "2.4 km",
        dieselRate: "₹89.80/L",
        facilities: ["Diesel High-Flow", "Air & Water", "24/7"]
      },
      {
        id: "p2",
        name: "Bharat Petroleum Mega Oasis",
        coords: [28.15, 77.58],
        dist: "6.8 km",
        dieselRate: "₹89.65/L",
        facilities: ["Diesel", "AdBlue Available", "Truck Rest Stop"]
      },
      {
        id: "p3",
        name: "HP Commercial Highway Oasis",
        coords: [27.85, 77.82],
        dist: "14.2 km",
        dieselRate: "₹89.70/L",
        facilities: ["Commercial Fleet Pump", "Tyre Service", "Driver Lounge"]
      }
    ];

    const dhabas = [
      {
        id: "d1",
        name: "Murthal King Dhaba",
        coords: [28.45, 77.32],
        dist: "3.1 km",
        rating: "4.7 ★",
        features: "Spacious Truck Parking, Pure Vegetarian, AC Restroom"
      },
      {
        id: "d2",
        name: "Puran Singh Ka Highway Dhaba",
        coords: [28.05, 77.68],
        dist: "8.5 km",
        rating: "4.5 ★",
        features: "24/7 Hot Food, Safe Night Truck Parking, Chai Stall"
      },
      {
        id: "d3",
        name: "Shree Ram Driver Rest & Dhaba",
        coords: [27.7, 77.95],
        dist: "12.0 km",
        rating: "4.3 ★",
        features: "Hot Showers, Budget Driver Meals, Desi Ghee Roti"
      }
    ];

    if (type === "fuel") {
      return res.status(200).json({ petrolPumps });
    }
    if (type === "dhaba") {
      return res.status(200).json({ dhabas });
    }

    return res.status(200).json({ petrolPumps, dhabas });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch amenities", error: error.message });
  }
});

module.exports = router;
