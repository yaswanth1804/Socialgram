import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";

export class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const success = (res, message = "Success", statusCode = 200, data = []) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const TryCatch = (passedFunction) => async (req, res, next) => {
  try {
    await passedFunction(req, res, next);
  } catch (error) {
    return next(error);
  }
};

export const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

export const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  return res.status(code).cookie("insta-token", token, cookieOptions).json({
    success: true,
    user,
    message,
  });
};

const getBase64 = (buffer) => {
  if (!buffer) {
    throw new Error("Invalid buffer for Cloudinary upload");
  }
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
};

export const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((fileBuffer) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(fileBuffer),
        { resource_type: "image", public_id: uuid() },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  } catch (err) {
    console.error("Error during Cloudinary upload:", err);
    throw new Error("Error uploading files to Cloudinary");
  }
};

