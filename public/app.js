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
document.getElementById("avatarInput");

const loginBtn =
document.getElementById("loginBtn");

const registerBtn =
document.getElementById("registerBtn");

const logoutBtn =
document.getElementById("logoutBtn");

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

const msgInput =
document.getElementById("msg");

const sendBtn =
document.getElementById("sendBtn");

let currentUser = "";

let selectedUser = "";

let allUsers = [];

const savedUser =
localStorage.getItem("username");

if(savedUser){

currentUser = savedUser;

me.innerText =
"👤 " + currentUser;

auth.style.display = "none";

app.style.display = "block";

}

loginBtn.onclick = ()=>{

socket.emit("login", {

username:
usernameInput.value,

password:
passwordInput.value

});

};

registerBtn.onclick = ()=>{

const file =
avatarInput.files[0];

const formData =
new FormData();

formData.append(
"avatar",
file
);

fetch("/upload",{

method:"POST",

body:formData

})

.then(res=>res.json())

.then(data=>{

socket.emit("register", {

username:
usernameInput.value,

password:
passwordInput.value,

avatar:data.image

});

});

};

logoutBtn.onclick = ()=>{

localStorage.clear();

location.reload();

};

sendBtn.onclick = ()=>{

if(
msgInput.value === "" ||
selectedUser === ""
)
return;

socket.emit(
"privateMessage",
{

user:currentUser,

to:selectedUser,

text:msgInput.value

}

);

msgInput.value = "";

};

socket.on("registerSuccess", ()=>{

alert("Registered");

});

socket.on("registerError", err=>{

alert(err);

});

socket.on("loginSuccess", ()=>{

currentUser =
usernameInput.value;

localStorage.setItem(
"username",
currentUser
);

me.innerText =
"👤 " + currentUser;

auth.style.display = "none";

app.style.display = "block";

});

socket.on("loginError", err=>{

alert(err);

});

socket.on("users", users=>{

allUsers = users;

renderUsers(users);

});

function renderUsers(users){

usersDiv.innerHTML = "";

users.forEach(user=>{

if(user.username === currentUser)
return;

usersDiv.innerHTML += `

<div class="user"
onclick="selectUser('${user.username}')">

<img
class="avatar"
src="${user.avatar}"
>

<div>

${user.online ? "🟢" : "⚫"}

${user.username}

</div>

</div>

`;

});

}

function selectUser(user){

selectedUser = user;

chatTop.innerText =
"Chat with " + user;

chat.innerHTML = "";

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

socket.on(
"privateMessage",
data=>{

if(
data.user === selectedUser ||
data.to === selectedUser
){

chat.innerHTML += `

<div class="message">

<b>${data.user}</b>

<br>

${data.text}

</div>

`;

chat.scrollTop =
chat.scrollHeight;

}

});
