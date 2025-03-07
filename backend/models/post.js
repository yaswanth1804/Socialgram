
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    caption: { type: String, default: "" },
    image: [
      {
        public_id: {
          type: String,
          required: [true, "Please add public id"],
        },
        url: {
          type: String,
          required: [true, "Please add image url"],
        },
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    // Shares tracking
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who shared the post
    originalPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null }, // Reference to the original post if shared
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
