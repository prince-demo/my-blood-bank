const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
} = require("../controllers/inventoryController");

const router = express.Router();

// Routes
// POST - Create Inventory
router.post("/create-inventory", authMiddleware, createInventoryController);

// GET - Get All Blood Records
router.get("/get-inventory", authMiddleware, getInventoryController);

// GET - Get Recent Blood Records
router.get("/get-recent-inventory", authMiddleware, getRecentInventoryController);

// POST - Get Hospital Blood Records
router.post(
  "/get-inventory-hospital",
  authMiddleware,
  getInventoryHospitalController
);

//GET DONAR RECORDS
router.get("/get-donars", authMiddleware, getDonarsController);

// GET - Get Donor Records
router.get("/get-hospitals", authMiddleware, getHospitalController);

// GET - Get Hospital Records
router.get("/hospitals", authMiddleware, getHospitalController);

// GET - Get Organization Records
router.get("/get-orgnaisation", authMiddleware, getOrgnaisationController);

// GET - Get Organization Records for Hospital
router.get(
  "/get-orgnaisation-for-hospital",
  authMiddleware,
  getOrgnaisationForHospitalController
);

module.exports = router;
