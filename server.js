const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));
app.use(express.json());

const adapter =
new JSONFile("db.json");

const db =
new Low(adapter, {
users: [],
messages: []
});

let onlineUsers = {};

async function start(){

await db.read();

io.on("connection", socket=>{

socket.on("register", async data=>{

const exists =
db.data.users.find(
u => u.username === data.username
);

if(exists){

socket.emit(
"registerError",
"User already exists"
);

return;

}

db.data.users.push({

username:data.username,
password:data.password

});

await db.write();

socket.emit(
"registerSuccess"
);

});

socket.on("login", async data=>{

const user =
db.data.users.find(

u =>
u.username === data.username &&
u.password === data.password

);

if(user){

socket.username =
data.username;

onlineUsers[socket.id] =
data.username;

socket.emit(
"loginSuccess"
);

socket.emit(
"oldMessages",
db.data.messages
);

io.emit(
"users",
Object.values(onlineUsers)
);

}else{

socket.emit(
"loginError",
"Wrong login"
);

}

});

socket.on(
"privateMessage",
async data=>{

const targetSocket =
Object.keys(onlineUsers).find(

id =>
onlineUsers[id] === data.to

);

if(targetSocket){

const msg = {

user:data.user,
to:data.to,
text:data.text

};

db.data.messages.push(msg);

await db.write();

io.to(targetSocket)
.emit(
"privateMessage",
msg
);

socket.emit(
"privateMessage",
msg
);

}

});

socket.on(
"disconnect",
()=>{

delete onlineUsers[socket.id];

io.emit(
"users",
Object.values(onlineUsers)
);

});

});

server.listen(

process.env.PORT || 3000,

()=>{

console.log(
"Server started"
);

});

}

start();
