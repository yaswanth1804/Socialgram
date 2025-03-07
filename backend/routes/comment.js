import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addComment,
  deleteComment,
  dislikeComment,
  getCommentsOfPost,
  likeComment,
  updateComment,
} from "../controllers/comment.js";

const app = express();

app.use(isAuthenticated);
app.get("/:id/comment/all", getCommentsOfPost);
app.post("/:id/comment", addComment);
app.put("/comment/:id/update", updateComment);
app.delete("/comment/:id/delete", deleteComment);
app.put("/comment/:id/like", likeComment);
app.put("/comment/:id/dislike", dislikeComment);

export default app;
