import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { Conversation } from "../models/conversation.js";
import { success, TryCatch } from "../utils/features.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = TryCatch(async (req, res, next) => {
  const senderId = req.user;
  const receiverId = req.params.id;
  const { message } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) conversation.messages.push(newMessage._id);

  await Promise.all([newMessage.save(), conversation.save()]);

  const senderUser = await User.findById(senderId);
  const notification = {
    type: "message",
    user: senderUser,
    message: `${senderUser.username} sent you a message.`,
  };

  const receiverSocketId = getReceiverSocketId(receiverId);
  // if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage); 
  // else io.to(receiverSocketId).emit("notification", notification);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage); 
    io.to(receiverSocketId).emit("notification", notification); 
  }

  return success(res, "Message sent", 201, newMessage);
});

export const getMessage = TryCatch(async (req, res, next) => {
  const senderId = req.user;
  const receiverId = req.params.id;

  const conversation = await Conversation.findOne({
    participants: {$all: [senderId, receiverId]}
  }).populate("messages");
  const messages = conversation?.messages;

  return success(res, "Conversation fetched successfully", 200, messages);
});