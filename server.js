const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const multer = require("multer");

const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();

const server =
http.createServer(app);

const io =
new Server(server);

app.use(express.static("public"));
app.use(express.json());

app.use(
"/uploads",
express.static("uploads")
);

const storage =
multer.diskStorage({

destination:(req,file,cb)=>{

cb(null,"uploads");

},

filename:(req,file,cb)=>{

cb(
null,
Date.now() + "-" + file.originalname
);

}

});

const upload =
multer({ storage });

app.post(
"/upload",
upload.single("avatar"),
(req,res)=>{

res.json({

image:
"/uploads/" + req.file.filename

});

});

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

socket.on(
"register",
async data=>{

const exists =
db.data.users.find(

u =>
u.username === data.username

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

password:data.password,

avatar:data.avatar

});

await db.write();

socket.emit(
"registerSuccess"
);

});

socket.on(
"login",
async data=>{

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

const users =
db.data.users.map(u=>({

username:u.username,

avatar:u.avatar,

online:
Object.values(
onlineUsers
).includes(
u.username
)

}));

io.emit(
"users",
users
);

socket.emit(
"oldMessages",
db.data.messages
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

const msg = {

user:data.user,

to:data.to,

text:data.text

};

db.data.messages.push(msg);

await db.write();

const targetSocket =
Object.keys(onlineUsers).find(

id =>
onlineUsers[id] === data.to

);

if(targetSocket){

io.to(targetSocket)
.emit(
"privateMessage",
msg
);

}

socket.emit(
"privateMessage",
msg
);

});

socket.on(
"disconnect",
()=>{

delete onlineUsers[socket.id];

const users =
db.data.users.map(u=>({

username:u.username,

avatar:u.avatar,

online:
Object.values(
onlineUsers
).includes(
u.username
)

}));

io.emit(
"users",
users
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
