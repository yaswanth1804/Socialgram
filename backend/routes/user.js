import express from "express";
import {
    editProfile,
    followOrUnfollow,
  getProfile,
  getSuggestedUsers,
  login,
  logout,
  register,
} from "../controllers/user.js";
import {isAuthenticated} from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const app = express();

app.post("/register",register);
app.post("/login",login);
app.get("/logout", logout);

app.use(isAuthenticated);
app.get("/:id/profile", getProfile);
app.post("/profile/edit", upload.single("profilePicture"), editProfile);
app.get("/suggested", getSuggestedUsers);
app.post("/followorunfollow/:id", followOrUnfollow);

export default app;

