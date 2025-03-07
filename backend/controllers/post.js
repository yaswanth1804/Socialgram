import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { Comment } from "../models/comment.js";
import { Reply } from "../models/reply.js";
import { ErrorHandler, success, TryCatch, uploadFilesToCloudinary } from "../utils/features.js";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const getAllPosts = TryCatch(async (req, res, next) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate({ path: "author", select: "-password" })
    .populate({
      path: "comments",
      sort: { createdAt: -1 },
      populate: [
        { path: "author", select: "username profilePicture" },
        {
          path: "replies",
          populate: { path: "author", select: "username profilePicture" },
        },
      ],
    });

  return success(res, "All posts fetched successfully", 200, posts);
});

export const getUsersPosts = TryCatch(async (req, res, next) => {
  const posts = await Post.find({ author: req.user })
    .sort({ createdAt: -1 })
    .populate({ path: "author", select: "-password" })
    .populate({
      path: "comments",
      sort: { createdAt: -1 },
      populate: { path: "author", select: "username profilePicture" },
    });

  return success(res, "All posts of user fetched successfully", 200, posts);
});

export const createPost = TryCatch(async (req, res, next) => {
  const { caption } = req.body;
  const image = req.file;
  const authorId = req.user;

  if (!image) return next(new ErrorHandler("Image required", 400));

  const optimizedImage = await sharp(image.buffer)
    .resize({ width: 800, height: 800, fit: "inside" })
    .toFormat("jpeg", { quality: 80 })
    .toBuffer();

  let uploadedImage;

  try {
    const result = await uploadFilesToCloudinary([optimizedImage]);
    uploadedImage = {
      public_id: result[0].public_id,
      url: result[0].url,
    };
  } catch (error) {
    console.error("Error uploading post image to Cloudinary:", error);
    return next(
      new ErrorHandler("Error uploading post image to Cloudinary", 500)
    );
  }

  const post = await Post.create({
    caption,
    image: uploadedImage,
    author: authorId,
  });

  const user = await User.findById(authorId);
  if (user) {
    user.posts.push(post._id);
    await user.save();
  }

  await post.populate({ path: "author", select: "-password" });

  return success(res, "Post created successfully", 200, post);
});

export const updatePost = TryCatch(async (req, res, next) => {
  console.log("post update");
  const { id } = req.params;
  const { caption } = req.body;
  const userId = req.user;

  console.log("postId", id);
  console.log("caption", caption);

  if (!caption) return next(new ErrorHandler("Caption is required", 400));

  const post = await Post.findById(id);
  if (!post) return next(new ErrorHandler("Post not found", 404));

  if (post.author.toString() !== userId)
    return next(
      new ErrorHandler("You are not authorized to update this post", 403)
    );

  post.caption = caption;
  await post.save();

  return success(res, "Post updated successfully", 200, post);
});

export const deletePost = TryCatch(async (req, res, next) => {
  const postId = req.params.id;
  const authorId = req.user;
  const post = await Post.findById(postId);
  if (!post) return next(new ErrorHandler("Post not found", 404));

  if (post.author.toString() !== authorId)
    return next(
      new ErrorHandler("You are not authorized to delete this post", 403)
    );

  await Post.findByIdAndDelete(postId);

  // delete all posts from user table
  const user = await User.findById(authorId);
  user.posts = user.posts.filter((id) => id.toString() !== postId);
  await user.save();

  // delete cloudinary image
  try {
    await cloudinary.uploader.destroy(post.image[0].public_id);
  } catch (error) {
    console.error("Error deleting post image from Cloudinary:", error);
    return next(new ErrorHandler("Error deleting post image", 500));
  }

  // Delete all comments of the post
  const comments = await Comment.find({ post: postId });
  const commentIds = comments.map((comment) => comment._id); // Get all comment IDs

  await Comment.deleteMany({ post: postId });

  // Delete all replies associated with deleted comments
  await Reply.deleteMany({ comment: { $in: commentIds } });

  return success(res, "Post delete successfully", 200);
});

export const likePost = TryCatch(async (req, res, next) => {
    const likeUserId = req.user;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post) return next(new ErrorHandler("Post not found", 404));

    await post.updateOne({ $addToSet: { likes: likeUserId } });
    await post.save();

    const user = await User.findById(likeUserId).select("username profilePicture");
    const postOwnerId = post.author.toString();

    if(postOwnerId !== likeUserId){
      
      const notification = {
        type: "like",
        user,
        post,
        message: `${user.username} like your post.`,
      };

      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification", notification);
      console.log("send");
    }

    return success(res, "Post liked", 200);
});
 
export const dislikePost = TryCatch(async (req, res, next) => {
    const likeUserId = req.user;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post) return next(new ErrorHandler("Post not found", 404));

    await post.updateOne({ $pull: { likes: likeUserId } });
    await post.save();

    const user = await User.findById(likeUserId).select(
      "username profilePicture"
    );
    const postOwnerId = post.author.toString();

    if (postOwnerId !== likeUserId) {
      const notification = {
        type: "dislike",
        user,
        post,
        message: `${user.username} disliked your post.`,
      };

      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification", notification);
    }

    return success(res, "Post disliked", 200);
});

export const bookmarkPost = TryCatch(async (req, res, next) => {
    const postId = req.params.id;
    const authorId = req.user;
    const post = await Post.findById(postId);
    if(!post) return next(new ErrorHandler("Post not found", 404));

    const user = await User.findById(authorId);
    if(user.bookmarks.includes(postId)){
        await user.updateOne({$pull: {bookmarks: postId}});
        await user.save();
        // return success(res, "Post removed from bookmark", 200);  
        return res
          .status(200)
          .json({
            type: "unsaved",
            message: "Post removed from bookmark",
            success: true,
          });
    }
    else{
        await user.updateOne({$push: {bookmarks: postId}});
        await user.save();
        // return success(res, "Post bookmarked", 200);  
        return res
          .status(200)
          .json({ type: "saved", message: "Post bookmarked", success: true });
    }  
});
