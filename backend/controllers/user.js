import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import sharp from "sharp";
import {
  ErrorHandler,
  sendToken,
  success,
  TryCatch,
  cookieOptions,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const register = TryCatch(async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User with this email already exists", 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  sendToken(res, user, 201, "Account created successfully");
});

export const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Something is missing, please check!", 404));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid Email or Password", 404));

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch)
    return next(new ErrorHandler("Invalid Email or Password", 404));

  const populatedPost = await Promise.all(
    user.posts.map(async (postId) => {
      const post = await Post.findById(postId);
      if (post.author.equals(user._id)) {
        return post;
      }
      return null;
    })
  );

  user.posts = populatedPost;

  sendToken(res, user, 200, `Welcome back ${user.username}`);
});

export const logout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie("insta-token", "", { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "Logout Successfully!",
    });
});

export const getProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({ path: "posts", createdAt: -1 })
    .populate("bookmarks")
    .populate({
      path: "followers",
      select: "username bio profilePicture _id",
    })
    .populate({
      path: "following",
      select: "username bio profilePicture _id",
    });
  if (!user) return new ErrorHandler("User not Found", 404);
  return success(res, "Profile fetched successfully", 200, user);
});

export const editProfile = TryCatch(async (req, res, next) => {
  const userId = req.user;
  const { bio, gender } = req.body;
  const profilePicture = req.file;

  const user = await User.findById(userId).select("-password");
  if (!user) return next(new ErrorHandler("User not Found", 404));

  if (profilePicture) {
    // Check if the user already has a profile picture and delete it
    if (user.profilePicture?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      } catch (error) {
        console.error(
          "Error deleting old Profile Picture from Cloudinary:",
          error
        );
        return next(
          new ErrorHandler("Error deleting old Profile Picture", 500)
        );
      }
    }

    // Process and upload the new profile picture
    try {
      const optimizedImage = await sharp(profilePicture.buffer)
        .resize({ width: 800, height: 800, fit: "inside" })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();

      const result = await uploadFilesToCloudinary([optimizedImage]);
      user.profilePicture = {
        public_id: result[0].public_id,
        url: result[0].url,
      };
    } catch (error) {
      console.error(
        "Error uploading new Profile Picture to Cloudinary:",
        error
      );
      return next(new ErrorHandler("Error uploading new Profile Picture", 500));
    }
  }

  if (bio) user.bio = bio;
  if (gender) user.gender = gender;

  const updatedUser = await user.save();
  return success(res, "Profile updated successfully", 200, updatedUser);
});

export const getSuggestedUsers = TryCatch(async (req, res, next) => {
  const suggestedUsers = await User.find({ _id: { $ne: req.user } }).select(
    "-password"
  );
  if (!suggestedUsers)
    return new ErrorHandler("Currently do not have any users", 404);
  return success(
    res,
    "Suggested Users fetched successfully",
    200,
    suggestedUsers
  );
});

export const followOrUnfollow = TryCatch(async (req, res, next) => {
  const loginUserId = req.user;
  const targetUserId = req.params.id;
  if (loginUserId === targetUserId)
    return new ErrorHandler("You cannot follow or unfollow yourself", 400);

  const loginUser = await User.findById(loginUserId);
  const targetUser = await User.findById(targetUserId);
  if (!loginUser || !targetUser) return new ErrorHandler("User not Found", 404);

  const isFollowing = loginUser.following.includes(targetUserId);

  if (isFollowing) {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $pull: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $pull: { followers: loginUserId } }
      ),
    ]);
    const notification = {
      type: "unfollow",
      user: targetUser,
      message: `${targetUser.username} started unfollowing you.`,
    };

    const followingUserSocketId = getReceiverSocketId(targetUserId);
    io.to(followingUserSocketId).emit("notification", notification);

    return success(res, "Unfollow user successfully", 200);
  } else {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $push: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $push: { followers: loginUserId } }
      ),
    ]);

    const notification = {
      type: "follow",
      user: targetUser,
      message: `${targetUser.username} started following you.`,
    };

    const followingUserSocketId = getReceiverSocketId(targetUserId);
    io.to(followingUserSocketId).emit("notification", notification);
    return success(res, "Follow user successfully", 200);
  }
});

   