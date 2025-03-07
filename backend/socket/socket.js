import express from "express";
import http from "http";
import {Server} from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {};  //user socket id

export const getReceiverSocketId = (receiverId) =>  userSocketMap[receiverId];

io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        console.log(`User connected: UserId: ${userId}, SocketId: ${socket.id}`);
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap)); 

    socket.on("disconnect", ()=>{
        console.log(
          `User disconnected: UserId: ${userId}, SocketId: ${socket.id}`
        );
        delete(userSocketMap[userId]);
    });
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); 
})

export {app, server, io};