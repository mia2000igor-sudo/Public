const express = require("express");

const http = require("http");

const { Server } = require("socket.io");

const app = express();

const server =
http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket=>{

socket.on("join", username=>{

io.emit("message", {
user:"SYSTEM",
text:username + " joined"
});

});

socket.on("message", data=>{

io.emit("message", data);

});

});

server.listen(
process.env.PORT || 3000,
()=>{

console.log("Server started");

});
