import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addReply,
  deleteReply,
  getRepliesOfComment,
  updateReply,
  likeReply,
  dislikeReply,
} from "../controllers/reply.js";

const app = express();

app.use(isAuthenticated);
app.get("/:id/reply/all", getRepliesOfComment);
app.post("/:id/reply", addReply);
app.put("/reply/:id/update", updateReply);
app.delete("/reply/:id/delete", deleteReply);
app.put("/reply/:id/like", likeReply);
app.put("/reply/:id/dislike", dislikeReply);

export default app;
