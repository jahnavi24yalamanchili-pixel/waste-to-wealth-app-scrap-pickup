import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { UserModel } from "../models/UserModel.js";

export const userRouter = exp.Router();

//get collectors for admin assignment
userRouter.get("/collectors", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const collectors = await UserModel.find({ role: "COLLECTOR" })
      .select("-password")
      .sort({ name: 1 });

    res.status(200).json({ message: "collectors", payload: collectors });
  } catch (err) {
    next(err);
  }
});

//get customers for admin view
userRouter.get("/customers", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const customers = await UserModel.find({ role: "CUSTOMER" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "customers", payload: customers });
  } catch (err) {
    next(err);
  }
});
