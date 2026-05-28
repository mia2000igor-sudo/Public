const express = require("express");

const http = require("http");

const { Server } = require("socket.io");

const app = express();

const server =
http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", socket=>{

socket.on("join", username=>{

users[socket.id] = username;

io.emit("users",
Object.values(users));

io.emit("message", {

user:"SYSTEM",
text: username + " joined"

});

});

socket.on("message", data=>{

io.emit("message", data);

});

socket.on("disconnect", ()=>{

delete users[socket.id];

io.emit("users",
Object.values(users));

});

});

server.listen(

process.env.PORT || 3000,

()=>{

console.log("Server started");

});
