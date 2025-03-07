import cookieParser from "cookie-parser";
import express, { urlencoded } from "express"
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import { v2 as cloudinary } from "cloudinary";
import { app, server } from "./socket/socket.js";
import path from "path";

// routes
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";
import commentRoutes from "./routes/comment.js";
import replyRoutes from "./routes/reply.js";
import messageRoutes from "./routes/message.js";
import { errorMiddleware } from "./middlewares/error.js";

// Load environment variables
dotenv.config({ path: "./.env" });
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 4000;

const __dirname = path.resolve(); 

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended: true}));
app.use(cookieParser());
app.use(
   cors(
      {
        origin: process.env.CLIENT_URL,
        // origin: '*',
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        credentials: true,
      }
   )
);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/post", commentRoutes);
app.use("/api/post/comment", replyRoutes);
app.use("/api/message", messageRoutes);

app.use(errorMiddleware);

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

server.listen(port, ()=> {
    connectDB(mongoUri);
    console.log(`Server listen at port ${port}`)
});
