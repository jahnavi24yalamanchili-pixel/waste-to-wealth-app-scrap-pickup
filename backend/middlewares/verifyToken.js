import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Please login to continue." });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Your session is no longer valid. Please login again." });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "You do not have permission to do this action." });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ message: "Your session has expired. Please login again." });
    }
  };
};
