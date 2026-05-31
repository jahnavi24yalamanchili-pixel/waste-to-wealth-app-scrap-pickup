import bcrypt from "bcryptjs";
import exp from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken.js";
import { UserModel } from "../models/UserModel.js";

export const authRouter = exp.Router();

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
  greenPoints: user.greenPoints,
  vehicleNumber: user.vehicleNumber,
  isAvailable: user.isAvailable,
});

//register
authRouter.post("/register", async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = "CUSTOMER",
      vehicleNumber = "",
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Please fill all required fields.",
      });
    }

    if (role === "COLLECTOR" && !vehicleNumber.trim()) {
      return res.status(400).json({
        message: "Collectors must enter a vehicle number.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountRole = role === "COLLECTOR" ? "COLLECTOR" : "CUSTOMER";
    const user = await UserModel.create({
      ...req.body,
      role: accountRole,
      vehicleNumber: accountRole === "COLLECTOR" ? vehicleNumber : "",
      password: hashedPassword,
    });

    const token = createToken(user);
    res.status(201).json({
      message: "registration success",
      token,
      payload: userPayload(user),
    });
  } catch (err) {
    next(err);
  }
});

//login
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both email and password.",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    const token = createToken(user);
    res.status(200).json({
      message: "login success",
      token,
      payload: userPayload(user),
    });
  } catch (err) {
    next(err);
  }
});

//logged in user
authRouter.get("/me", verifyToken(), (req, res) => {
  res.status(200).json({ message: "current user", payload: req.user });
});
