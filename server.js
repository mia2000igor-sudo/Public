const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const DB = "db.json";

function readDB(){

if(!fs.existsSync(DB)){

fs.writeFileSync(DB,
JSON.stringify({
users:[],
messages:[]
},null,2));

}

return JSON.parse(
fs.readFileSync(DB)
);

}

function writeDB(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}

app.post("/register",(req,res)=>{

const db = readDB();

const {
username,
password
} = req.body;

const exists =
db.users.find(
u => u.username === username
);

if(exists){

return res.json({
error:"User already exists"
});

}

db.users.push({

username,
password,

friends:[],
requests:[],

avatar:"",
status:""

});

writeDB(db);

res.json({
success:true
});

});

app.post("/login",(req,res)=>{

const db = readDB();

const {
username,
password
} = req.body;

const user =
db.users.find(
u =>
u.username === username
&&
u.password === password
);

if(!user){

return res.json({
error:"Wrong login"
});

}

res.json(user);

});

app.get("/users",(req,res)=>{

const db = readDB();

res.json(db.users);

});

app.post("/add-friend",(req,res)=>{

const db = readDB();

const {
from,
to
} = req.body;

const user =
db.users.find(
u => u.username === to
);

if(!user){

return res.json({
error:"User not found"
});

}

if(
!user.requests.includes(from)
){

user.requests.push(from);

}

writeDB(db);

res.json({
success:true
});

});

app.post("/accept-friend",(req,res)=>{

const db = readDB();

const {
user,
friend
} = req.body;

const me =
db.users.find(
u => u.username === user
);

const other =
db.users.find(
u => u.username === friend
);

if(!me || !other){

return res.json({
error:"Users not found"
});

}

if(
!me.friends.includes(friend)
){

me.friends.push(friend);

}

if(
!other.friends.includes(user)
){

other.friends.push(user);

}

me.requests =
me.requests.filter(
r => r !== friend
);

writeDB(db);

res.json({
success:true
});

});

app.post("/send-message",(req,res)=>{

const db = readDB();

db.messages.push(req.body);

writeDB(db);

res.json({
success:true
});

});

app.get("/messages",(req,res)=>{

const db = readDB();

res.json(db.messages);

});

const PORT =
process.env.PORT || 3000;

app.listen(PORT,()=>{

console.log(
"Server started"
);

});
