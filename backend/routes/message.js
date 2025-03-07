import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { sendMessage, getMessage } from "../controllers/message.js";

const app = express();

app.use(isAuthenticated);
app.post("/send/:id", sendMessage);
app.get("/all/:id", getMessage);

export default app;
