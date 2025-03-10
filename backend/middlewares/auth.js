import { ErrorHandler } from "../utils/features.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies["insta-token"];
  if (!token)
    return next(new ErrorHandler("Please login to access this route", 401));
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decodedData._id;
  next();
};
