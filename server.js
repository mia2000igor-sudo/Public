const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.static("public"));

let broadcaster;

io.on("connection", socket => {

    socket.on("broadcaster", () => {
        broadcaster = socket.id;
    });

    socket.on("watcher", () => {
        if (broadcaster) {
            io.to(broadcaster).emit("watcher", socket.id);
        }
    });

    socket.on("offer", (id, message) => {
        io.to(id).emit("offer", socket.id, message);
    });

    socket.on("answer", (id, message) => {
        io.to(id).emit("answer", socket.id, message);
    });

    socket.on("candidate", (id, message) => {
        io.to(id).emit("candidate", socket.id, message);
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
});const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
});

