const socket = io();

const auth =
document.getElementById("auth");

const app =
document.getElementById("app");

const usernameInput =
document.getElementById("username");

const passwordInput =
document.getElementById("password");

const avatarInput =
document.getElementById("avatar");

const registerBtn =
document.getElementById("registerBtn");

const loginBtn =
document.getElementById("loginBtn");

const me =
document.getElementById("me");

const usersDiv =
document.getElementById("users");

const search =
document.getElementById("search");

const chatTop =
document.getElementById("chatTop");

const chat =
document.getElementById("chat");

const messageInput =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

let currentUser = "";

let selectedUser = "";

let allUsers = [];

let allMessages = [];

registerBtn.onclick = async ()=>{

let avatar = "";

const file =
avatarInput.files[0];

if(file){

const formData =
new FormData();

formData.append(
"avatar",
file
);

const res =
await fetch("/upload",{

method:"POST",
body:formData

});

const data =
await res.json();

avatar = data.image;

}

socket.emit("register",{

username:
usernameInput.value,

password:
passwordInput.value,

avatar

});

};

loginBtn.onclick = ()=>{

socket.emit("login",{

username:
usernameInput.value,

password:
passwordInput.value

});

};

socket.on(
"registerSuccess",
()=>{

alert(
"Account created"
);

});

socket.on(
"registerError",
err=>{

alert(err);

});

socket.on(
"loginSuccess",
user=>{

currentUser =
user.username;

me.innerText =
"👤 " + currentUser;

auth.style.display =
"none";

app.style.display =
"flex";

});

socket.on(
"loginError",
err=>{

alert(err);

});

socket.on(
"users",
users=>{

allUsers = users;

renderUsers(users);

});

function renderUsers(users){

usersDiv.innerHTML = "";

users.forEach(user=>{

if(
user.username === currentUser
)
return;

usersDiv.innerHTML += `

<div class="user"
onclick="selectUser('${user.username}')">

<img
class="avatar"
src="${user.avatar || ''}"
>

<div>

${user.online ? "🟢" : "⚫"}

${user.username}

</div>

</div>

`;

});

}

search.oninput = ()=>{

const filtered =
allUsers.filter(

u =>
u.username
.toLowerCase()
.includes(
search.value.toLowerCase()
)

);

renderUsers(filtered);

};

function selectUser(user){

selectedUser = user;

chatTop.innerText =
"Chat with " + user;

renderMessages();

}

window.selectUser =
selectUser;

sendBtn.onclick = ()=>{

if(
messageInput.value === "" ||
selectedUser === ""
)
return;

socket.emit(
"privateMessage",
{

from:currentUser,
to:selectedUser,
text:messageInput.value

}

);

messageInput.value = "";

};

socket.on(
"messages",
messages=>{

allMessages = messages;

});

socket.on(
"privateMessage",
msg=>{

allMessages.push(msg);

renderMessages();

});

function renderMessages(){

chat.innerHTML = "";

const filtered =
allMessages.filter(

m =>

(m.from === currentUser &&
m.to === selectedUser)

||

(m.from === selectedUser &&
m.to === currentUser)

);

filtered.forEach(msg=>{

chat.innerHTML += `

<div class="message">

<b>${msg.from}</b>

<br>

${msg.text}

</div>

`;

});

chat.scrollTop =
chat.scrollHeight;

}
