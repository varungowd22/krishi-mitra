import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support memory mode when DB is disconnected
    if (mongoose.connection.readyState !== 1) {
      req.user = { _id: decoded.id, role: decoded.role };
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied for role: ${req.user.role}` });
  }
  next();
};
