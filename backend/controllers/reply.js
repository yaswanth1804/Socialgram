import { Reply } from "../models/reply.js";
import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { ErrorHandler, success, TryCatch } from "../utils/features.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const getRepliesOfComment = TryCatch(async (req, res, next) => {
  const commentId = req.params.id;

  const replies = await Reply.find({ comment: commentId }).populate({
    path: "author",
    select: "username profilePicture",
  });

  return success(res, "Replies fetched successfully", 200, replies);
});


export const addReply = TryCatch(async (req, res, next) => {
  const replyUserId = req.user;
  const commentId = req.params.id;
  const { text } = req.body;

  if (!text) return next(new ErrorHandler("Text is required", 400));

  const comment = await Comment.findById(commentId);
  if (!comment) return next(new ErrorHandler("Comment not found", 404));

  let reply = await Reply.create({
    author: replyUserId,
    comment: commentId,
    text,
  });

  reply = await reply.populate({
    path: "author",
    select: "username profilePicture",
  });

  comment.replies.push(reply._id);
  await comment.save();

  const user = await User.findById(replyUserId).select(
    "username profilePicture"
  );

  const post = await Post.findById(comment.post);

  const commentOwnerId = comment.author.toString();

  if (commentOwnerId !== replyUserId) {
    const notification = {
      type: "reply",
      user,
      post,
      comment,
      reply,
      message: `${user.username} replied on your comment.`,
    };

    const postOwnerSocketId = getReceiverSocketId(commentOwnerId);
    io.to(postOwnerSocketId).emit("notification", notification);
  }

  return success(res, "Reply added successfully", 201, reply);
});

export const updateReply = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user;

  if (!text) return next(new ErrorHandler("Text is required", 400));

  const reply = await Reply.findById(id);
  if (!reply) return next(new ErrorHandler("Reply not found", 404));

  if (reply.author.toString() !== userId)
    return next(
      new ErrorHandler("You are not authorized to update this reply", 403)
    );

  reply.text = text;
  await reply.save();

  return success(res, "Reply updated successfully", 200, reply);
});


export const deleteReply = TryCatch(async (req, res, next) => {
  const replyUserId = req.user;
  const replyId = req.params.id;

  const reply = await Reply.findById(replyId);
  if (!reply) return next(new ErrorHandler("Reply not found", 404));

  if (reply.author.toString() !== replyUserId)
    return next(
      new ErrorHandler("You are not authorized to delete this reply", 403)
    );

  await Reply.findByIdAndDelete(replyId);

  const comment = await Comment.findById(reply.comment);
  if (comment) {
    comment.replies = comment.replies.filter((id) => id.toString() !== replyId);
    await comment.save();
  }

  const user = await User.findById(replyUserId).select(
    "username profilePicture"
  );

  const post = await Post.findById(comment.post);

  const commentOwnerId = comment.author.toString();

  if (commentOwnerId !== replyUserId) {
    const notification = {
      type: "delete_reply",
      user,
      post,
      comment,
      message: `${user.username} delete reply from your comment.`,
    };

    const postOwnerSocketId = getReceiverSocketId(commentOwnerId);
    io.to(postOwnerSocketId).emit("notification", notification);
  }

  return success(res, "Reply deleted successfully", 200);
});

export const likeReply = TryCatch(async (req, res, next) => {
  const likeUserId = req.user;
  const replyId = req.params.id;

  const reply = await Reply.findById(replyId);
  if (!reply) return next(new ErrorHandler("Reply not found", 404));

  if (reply.likes.includes(likeUserId)) {
    return next(new ErrorHandler("You already liked this reply", 400));
  }

  await reply.updateOne({ $addToSet: { likes: likeUserId } });
  await reply.save();

  const user = await User.findById(likeUserId).select(
    "username profilePicture"
  );

  
  const comment = await Comment.findById(reply.comment);
  const postOwnerId = comment.author.toString();
  const replyOwnerId = reply.author.toString();
  const post = await Post.findById(comment.post);

  if (postOwnerId !== likeUserId && replyOwnerId !== likeUserId) {
    const notification = {
      type: "like_reply",
      user,
      post,
      reply,
      message: `${user.username} liked your reply.`,
    };

    const commentOwnerSocketId = getReceiverSocketId(comment.author.toString());
    io.to(commentOwnerSocketId).emit("notification", notification);
  }

  return success(res, "Reply liked", 200);
});

export const dislikeReply = TryCatch(async (req, res, next) => {
  const dislikeUserId = req.user;
  const replyId = req.params.id;

  const reply = await Reply.findById(replyId);
  if (!reply) return next(new ErrorHandler("Reply not found", 404));

  if (!reply.likes.includes(dislikeUserId)) {
    return next(new ErrorHandler("You have not liked this reply yet", 400));
  }

  await reply.updateOne({ $pull: { likes: dislikeUserId } });
  await reply.save();

  const user = await User.findById(dislikeUserId).select(
    "username profilePicture"
  );

  
  const comment = await Comment.findById(reply.comment);
  const postOwnerId = comment.author.toString();
  const replyOwnerId = reply.author.toString();
  const post = await Post.findById(comment.post);
  
  if (postOwnerId !== dislikeUserId && replyOwnerId !== dislikeUserId) {
    const notification = {
      type: "dislike_reply",
      user,
      post,
      reply,
      message: `${user.username} disliked your reply.`,
    };

    const commentOwnerSocketId = getReceiverSocketId(comment.author.toString());
    io.to(commentOwnerSocketId).emit("notification", notification);
  }

  return success(res, "Reply disliked", 200);
});
