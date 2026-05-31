import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { MaterialModel } from "../models/MaterialModel.js";
import { PickupModel } from "../models/PickupModel.js";
import { UserModel } from "../models/UserModel.js";

export const pickupRouter = exp.Router();

//create pickup request
pickupRouter.post("/pickup", verifyToken("CUSTOMER"), async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    const materialIds = items.map((item) => item.material);
    const materials = await MaterialModel.find({ _id: { $in: materialIds } });
    const materialMap = new Map(
      materials.map((material) => [material._id.toString(), material])
    );

    let estimatedAmount = 0;
    let greenPoints = 0;

    items.forEach((item) => {
      const material = materialMap.get(item.material);
      const weight = Number(item.estimatedWeightKg || 0);

      if (!material) {
        const error = new Error("Please select a valid scrap material.");
        error.status = 400;
        throw error;
      }

      estimatedAmount += material.pricePerKg * weight;
      greenPoints += material.greenPointsPerKg * weight;
    });

    const pickup = await PickupModel.create({
      ...req.body,
      customer: req.user._id,
      customerName: req.user.name,
      phone: req.user.phone,
      estimatedAmount: Math.round(estimatedAmount),
      greenPoints: Math.round(greenPoints),
      greenPointsAwarded: true,
    });

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { greenPoints: Math.round(greenPoints) } },
      { new: true }
    ).select("-password");

    const populatedPickup = await pickup.populate([
      "items.material",
      "customer",
      "assignedCollector",
    ]);
    res.status(201).json({
      message: "Pickup scheduled successfully. Green Points added to your account.",
      payload: populatedPickup,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

//collector sees open pickup requests
pickupRouter.get("/open-pickups", verifyToken("COLLECTOR"), async (req, res, next) => {
  try {
    const pickups = await PickupModel.find()
      .where("status")
      .equals("scheduled")
      .where("rejectedCollectors")
      .nin([req.user._id])
      .populate("items.material")
      .populate("customer", "name email phone greenPoints")
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.status(200).json({ message: "open pickups", payload: pickups });
  } catch (err) {
    next(err);
  }
});

//customer pickup history
pickupRouter.get("/my-pickups", verifyToken("CUSTOMER"), async (req, res, next) => {
  try {
    const pickups = await PickupModel.find({ customer: req.user._id })
      .populate("items.material")
      .populate("assignedCollector", "name phone vehicleNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "my pickups", payload: pickups });
  } catch (err) {
    next(err);
  }
});

//collector assigned pickups
pickupRouter.get(
  "/collector-pickups",
  verifyToken("COLLECTOR"),
  async (req, res, next) => {
    try {
      const pickups = await PickupModel.find({ assignedCollector: req.user._id })
        .populate("items.material")
        .populate("customer", "name email phone address greenPoints")
        .sort({ scheduledDate: 1 });

      res.status(200).json({ message: "collector pickups", payload: pickups });
    } catch (err) {
      next(err);
    }
  }
);

//collector accepts pickup request
pickupRouter.put(
  "/accept/:pickupId",
  verifyToken("COLLECTOR"),
  async (req, res, next) => {
    try {
      const pickup = await PickupModel.findByIdAndUpdate(
        {
          _id: req.params.pickupId,
          status: "scheduled",
          assignedCollector: null,
        },
        {
          assignedCollector: req.user._id,
          status: "accepted",
        },
        { new: true }
      )
        .populate("items.material")
        .populate("customer", "name email phone greenPoints")
        .populate("assignedCollector", "name phone vehicleNumber");

      if (!pickup) {
        return res.status(409).json({
          message: "This pickup is no longer available.",
        });
      }

      res.status(200).json({
        message: "Pickup accepted. Customer can now see your details.",
        payload: pickup,
      });
    } catch (err) {
      next(err);
    }
  }
);

//collector rejects pickup request
pickupRouter.put(
  "/reject/:pickupId",
  verifyToken("COLLECTOR"),
  async (req, res, next) => {
    try {
      await PickupModel.findByIdAndUpdate(req.params.pickupId, {
        $addToSet: { rejectedCollectors: req.user._id },
      });

      res.status(200).json({ message: "Pickup request removed from your list." });
    } catch (err) {
      next(err);
    }
  }
);

//collector updates accepted pickup status
pickupRouter.put(
  "/status/:pickupId",
  verifyToken("COLLECTOR"),
  async (req, res, next) => {
    try {
      const { status, collectorNote = "" } = req.body;
      const pickup = await PickupModel.findById(req.params.pickupId);

      if (!pickup) {
        return res.status(404).json({ message: "Pickup request was not found." });
      }

      if (String(pickup.assignedCollector) !== String(req.user._id)) {
        return res.status(403).json({ message: "This pickup is assigned to another collector." });
      }

      pickup.status = status;
      pickup.collectorNote = collectorNote;
      await pickup.save();

      const updatedPickup = await PickupModel.findById(pickup._id)
        .populate("items.material")
        .populate("customer", "name email phone greenPoints")
        .populate("assignedCollector", "name phone vehicleNumber");

      res.status(200).json({ message: "pickup updated", payload: updatedPickup });
    } catch (err) {
      next(err);
    }
  }
);
