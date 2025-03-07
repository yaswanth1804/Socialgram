import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  bookmarkPost,
  createPost,
  deletePost,
  dislikePost,
  getAllPosts,
  getUsersPosts,
  likePost,
  updatePost,
} from "../controllers/post.js";

const app = express();

app.use(isAuthenticated);
app.get("/all", getAllPosts);
app.get("/all/user", getUsersPosts);
app.post("/new", upload.single("image"), createPost);
app.put("/:id/update", updatePost);
app.delete("/:id/delete", deletePost);
app.put("/:id/like", likePost);
app.put("/:id/dislike", dislikePost);
app.get("/:id/bookmark", bookmarkPost);

export default app;
