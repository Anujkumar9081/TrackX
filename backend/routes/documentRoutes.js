const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const auth = require("../Middleware/Auth");

// 1. GET ALL DOCUMENTS (with category or truck filter)
router.get("/", auth, async (req, res) => {
  try {
    const { category, truckNumber } = req.query;
    const filter = {};
    if (category) filter.category = category.toUpperCase();
    if (truckNumber) filter.truckNumber = truckNumber.toUpperCase().trim();

    const documents = await Document.find(filter).sort({ createdAt: -1 });

    // If database is empty, provide default structure from user's drawing
    if (documents.length === 0 && !truckNumber) {
      const defaults = [
        // Driver
        { category: "DRIVER", docType: "DRIVING_LICENSE", title: "Driving Licence (DL)", status: "VERIFIED" },
        { category: "DRIVER", docType: "AADHAAR_CARD", title: "Aadhaar Card", status: "VERIFIED" },
        // Truck
        { category: "TRUCK", docType: "REGISTRATION_CERTIFICATE_RC", title: "Registration Certificate (RC)", status: "VERIFIED" },
        { category: "TRUCK", docType: "INSURANCE", title: "Vehicle Insurance", status: "VERIFIED" },
        { category: "TRUCK", docType: "FITNESS_CERTIFICATE", title: "Fitness Certificate", status: "VERIFIED" },
        { category: "TRUCK", docType: "POLLUTION_UNDER_CONTROL_PUC", title: "Pollution Under Control (PUC)", status: "VERIFIED" },
        { category: "TRUCK", docType: "GOODS_VEHICLE_PERMIT", title: "Goods Vehicle National Permit", status: "VERIFIED" },
        { category: "TRUCK", docType: "MOTOR_VEHICLE_TAX_PROOF", title: "Motor Vehicle Tax Proof", status: "VERIFIED" },
        // Journey
        { category: "JOURNEY", docType: "COMMERCIAL_INVOICE", title: "Commercial Tax Invoice", status: "VERIFIED" },
        { category: "JOURNEY", docType: "E_WAY_BILL", title: "E-Way Bill (Government Portal)", status: "VERIFIED" },
        { category: "JOURNEY", docType: "GOODS_RECEIPT_BILTY", title: "Goods Receipt (Bilty / LR)", status: "VERIFIED" },
        { category: "JOURNEY", docType: "DELIVERY_CHALLAN", title: "Delivery Challan", status: "PENDING" }
      ];
      return res.status(200).json({ documents: defaults });
    }

    return res.status(200).json({ documents });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch documents", error: error.message });
  }
});

// 2. UPLOAD / ATTACH NEW DOCUMENT
router.post("/upload", auth, async (req, res) => {
  try {
    const { category, docType, title, documentNumber, expiryDate, truckNumber, driverName, fileUrl } = req.body;

    if (!category || !docType || !title) {
      return res.status(400).json({ message: "Category, docType, and title are required" });
    }

    const newDoc = new Document({
      category: category.toUpperCase(),
      docType,
      title,
      documentNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      truckNumber: truckNumber ? truckNumber.toUpperCase().trim() : null,
      driverName,
      fileUrl: fileUrl || "https://placehold.co/600x400/png?text=Verified+Doc",
      status: "VERIFIED",
      ownerId: req.user.userId
    });

    await newDoc.save();
    return res.status(201).json({ message: "Document uploaded successfully", document: newDoc });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload document", error: error.message });
  }
});

module.exports = router;
