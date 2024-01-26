const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

const handleServerError = (res, error, customMessage) => {
  console.error(`Error: ${customMessage || error.message}`);
  return res.status(500).send({
    success: false,
    message: customMessage || "Internal server error. Please try again later.",
    error: error.message,
  });
};

const createInventoryController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    
    if (!user) {
      throw new Error("User not found");
    }

      // if (inventoryType === "in" && user.role !== "donar") {
    //   throw new Error("Not a donar account");
    // }

    // if (inventoryType === "out" && user.role !== "hospital") {
    //   throw new Error("Not a hospital");
    // }

    if (req.body.inventoryType === "out") {
      const requestedBloodGroup = req.body.bloodGroup;
      const requestedQuantityOfBlood = req.body.quantity;
      const organisation = new mongoose.Types.ObjectId(req.body.userId);

      const totalInOfRequestedBlood = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);

      const totalIn = totalInOfRequestedBlood[0]?.total || 0;

      const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "out",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);

      const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

      const availableQuanityOfBloodGroup = totalIn - totalOut;

      if (availableQuanityOfBloodGroup < requestedQuantityOfBlood) {
        return res.status(500).send({
          success: false,
          message: `Only ${availableQuanityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`,
        });
      }

      req.body.hospital = user?._id;
    } else {
      req.body.donar = user?._id;
    }

    const inventory = new inventoryModel(req.body);
    await inventory.save();

    return res.status(201).send({
      success: true,
      message: "New Blood Record Added",
    });
  } catch (error) {
    return handleServerError(res, error, "Error In Create Inventory API");
  }
};

const getInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({
        organisation: req.body.userId,
      })
      .populate("donar")
      .populate("hospital")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Get all records successfully",
      inventory,
    });
  } catch (error) {
    return handleServerError(res, error, "Error In Get All Inventory");
  }
};



// 
const getDonarsController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    const donorId = await inventoryModel.distinct("donar", {
      organisation,
    });

    const donars = await userModel.find({ _id: { $in: donorId } });

    return res.status(200).send({
      success: true,
      message: "Donor Record Fetched Successfully",
      donars,
    });
  } catch (error) {
    return handleServerError(res, error, "Error in Donor records");
  }
};


const getHospitalController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    const hospitalId = await inventoryModel.distinct("hospital", {
      organisation,
    });

    const hospitals = await userModel.find({
      _id: { $in: hospitalId },
    });

    
    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    return handleServerError(res, error, "Error In Get Hospital API");
  }
};

const getOrgnaisationController = async (req, res) => {
  try {
    const donar = req.body.userId;
    const orgId = await inventoryModel.distinct("organisation", { donar });
    const organisations = await userModel.find({
      _id: { $in: orgId },
    });

    return res.status(200).send({
      success: true,
      message: "Organization Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    return handleServerError(res, error, "Error In Organization API");
  }
};

const getOrgnaisationForHospitalController = async (req, res) => {
  try {
    const hospital = req.body.userId;
    const orgId = await inventoryModel.distinct("organisation", { hospital });
    const organisations = await userModel.find({
      _id: { $in: orgId },
    });

    return res.status(200).send({
      success: true,
      message: "Hospital Organization Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    return handleServerError(res, error, "Error In Hospital Organization API");
  }
};

const getInventoryHospitalController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find(req.body.filters)
      .populate("donar")
      .populate("hospital")
      .populate("organisation")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Get hospital consumer records successfully",
      inventory,
    });
  } catch (error) {
    return handleServerError(res, error, "Error In Get consumer Inventory");
  }
};

const getRecentInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({
        organisation: req.body.userId,
      })
      .limit(3)
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Recent Inventory Data",
      inventory,
    });
  } catch (error) {
    return handleServerError(res, error, "Error In Recent Inventory API");
  }
};

module.exports = {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
};
