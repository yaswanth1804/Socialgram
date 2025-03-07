import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { ErrorHandler, success, TryCatch } from "../utils/features.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const getCommentsOfPost = TryCatch(async (req, res, next) => {
  const postId = req.params.id;
  const comments = await Comment.find({ post: postId }).populate({
    path: "author",
    select: "username profilePicture",
  });
  return success(res, "Comments fetched successfully", 200, comments);
});

export const addComment = TryCatch(async (req, res, next) => {
  console.log('Inside addComment')
  const commentUserId = req.user;
  const postId = req.params.id;
  const { text } = req.body;
  if (!text) return next(new ErrorHandler("Text is required", 400));
  const post = await Post.findById(postId);
  if (!post) return next(new ErrorHandler("Post not found", 404));

  let comment = await Comment.create({
    author: commentUserId,
    post: postId,
    text:text,
  });

  comment = await comment.populate({
    path: "author",
    select: "username profilePicture",
  });

  post.comments.push(comment._id);
  await post.save();

  const user = await User.findById(commentUserId).select(
    "username profilePicture"
  );

  const postOwnerId = post.author.toString();

  if (postOwnerId !== commentUserId) {
    const notification = {
      type: "comment",
      user,
      post,
      comment,
      message: `${user.username} commented on your post.`,
    };

    const postOwnerSocketId = getReceiverSocketId(postOwnerId);
    io.to(postOwnerSocketId).emit("notification", notification);
  }

  return success(res, "Comment Added", 201, comment);
});

export const updateComment = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user;

  if (!text) return next(new ErrorHandler("Text is required", 400));

  const comment = await Comment.findById(id);
  if (!comment) return next(new ErrorHandler("Comment not found", 404));

  if (comment.author.toString() !== userId)
    return next(
      new ErrorHandler("You are not authorized to update this comment", 403)
    );

  comment.text = text;
  await comment.save();

  return success(res, "Comment updated successfully", 200, comment);
});

export const deleteComment = TryCatch(async (req, res, next) => {
  const commentUserId = req.user;
  const commentId = req.params.id;
  const comment = await Comment.findById(commentId);
  if (!comment) return next(new ErrorHandler("Comment not found", 404));
  if (comment.author.toString() !== commentUserId)
    return next(
      new ErrorHandler("You are not authorized to delete this comment", 403)
    );

  await Comment.findByIdAndDelete(commentId);

  const post = await Post.findById(comment.post);
  if (post) {
    post.comments = post.comments.filter((id) => id.toString() !== commentId);
    await post.save();
  }

  const user = await User.findById(commentUserId).select(
    "username profilePicture"
  );

  const postOwnerId = post.author.toString();

  if (postOwnerId !== commentUserId) {
    const notification = {
      type: "delete_comment",
      user,
      post,
      comment,
      message: `${user.username} delete comment from your post.`,
    };

    const postOwnerSocketId = getReceiverSocketId(postOwnerId);
    io.to(postOwnerSocketId).emit("notification", notification);
  }

  return success(res, "Comment Deleted", 200);
});
export const likeComment = TryCatch(async (req, res, next) => {
  const likeUserId = req.user;
  const commentId = req.params.id;
  const comment = await Comment.findById(commentId);
  if (!comment) return next(new ErrorHandler("Comment not found", 404));

  // Check if the user already liked the comment
  if (comment.likes.includes(likeUserId)) {
    return next(new ErrorHandler("You have already liked this comment", 400));
  }

  await comment.updateOne({ $addToSet: { likes: likeUserId } });
  await comment.save();

  const user = await User.findById(likeUserId).select("username profilePicture");
  const post = await Post.findById(comment.post);

  const commentOwnerId = comment.author.toString();

  if (commentOwnerId !== likeUserId) {
    const notification = {
      type: "like_comment",
      user,
      post,
      comment,
      message: `${user.username} liked your comment.`,
    };

    const commentOwnerSocketId = getReceiverSocketId(commentOwnerId);
    io.to(commentOwnerSocketId).emit("notification", notification);
  }

  return success(res, "Comment liked", 200);
});


export const dislikeComment = TryCatch(async (req, res, next) => {
  const likeUserId = req.user;
  const commentId = req.params.id;
  const comment = await Comment.findById(commentId);
  if (!comment) return next(new ErrorHandler("Comment not found", 404));

  // Check if the user has liked the comment
  if (!comment.likes.includes(likeUserId)) {
    return next(new ErrorHandler("You haven't liked this comment yet", 400));
  }

  await comment.updateOne({ $pull: { likes: likeUserId } });
  await comment.save();

  const user = await User.findById(likeUserId).select("username profilePicture");
  const post = await Post.findById(comment.post);

  const commentOwnerId = comment.author.toString();

  if (commentOwnerId !== likeUserId) {
    const notification = {
      type: "dislike_comment",
      user,
      post,
      comment,
      message: `${user.username} disliked your comment.`,
    };

    const commentOwnerSocketId = getReceiverSocketId(commentOwnerId);
    io.to(commentOwnerSocketId).emit("notification", notification);
  }

  return success(res, "Comment disliked", 200);
});
