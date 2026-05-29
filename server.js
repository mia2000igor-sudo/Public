const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

function loadDB() {
  return JSON.parse(
    fs.readFileSync("db.json")
  );
}

function saveDB(data) {
  fs.writeFileSync(
    "db.json",
    JSON.stringify(data, null, 2)
  );
}

app.post(
  "/upload",
  upload.single("avatar"),
  (req, res) => {

    res.json({
      image: "/uploads/" + req.file.filename
    });

  }
);

app.post("/register", (req, res) => {

  const db = loadDB();

  const {
    username,
    password,
    avatar
  } = req.body;

  const exists = db.users.find(
    u => u.username === username
  );

  if (exists) {
    return res.json({
      error: "User already exists"
    });
  }

  db.users.push({
    username,
    password,
    avatar,
    status: "Hello 😄",
    friends: [],
    requests: []
  });

  saveDB(db);

  res.json({
    success: true
  });

});

app.post("/login", (req, res) => {

  const db = loadDB();

  const {
    username,
    password
  } = req.body;

  const user = db.users.find(
    u =>
      u.username === username &&
      u.password === password
  );

  if (!user) {
    return res.json({
      error: "Wrong login"
    });
  }

  res.json(user);

});

app.get("/users", (req, res) => {

  const db = loadDB();

  res.json(db.users);

});

app.post("/add-friend", (req,res)=>{

const {from,to} = req.body;

const db = readDB();

const user =
db.users.find(
u => u.username === to
);

if(!user){

return res.json({
error:"User not found"
});

}

if(!user.requests){

user.requests = [];

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

  }

  if (!user.requests.includes(from)) {
    user.requests.push(from);
  }

  saveDB(db);

  res.json({
    success: true
  });

});

app.post("/accept-friend", (req,res)=>{

const {user,friend} = req.body;

const db = readDB();

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

if(!me.friends){

me.friends = [];

}

if(!other.friends){

other.friends = [];

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

app.get("/messages", (req, res) => {

  const db = loadDB();

  res.json(db.messages);

});

app.post("/send-message", (req, res) => {

  const db = loadDB();

  const {
    from,
    to,
    text
  } = req.body;

  db.messages.push({
    from,
    to,
    text
  });

  saveDB(db);

  io.emit("newMessage");

  res.json({
    success: true
  });

});

io.on("connection", socket => {

  console.log("User connected");

});

server.listen(
  process.env.PORT || 3000,
  () => {

    console.log(
      "Server started"
    );

  }
);
