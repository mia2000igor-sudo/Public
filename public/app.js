const socket = io();

const auth =
document.getElementById("auth");

const app =
document.getElementById("app");

const usernameInput =
document.getElementById("username");

const passwordInput =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

const registerBtn =
document.getElementById("registerBtn");

const logoutBtn =
document.getElementById("logoutBtn");

const me =
document.getElementById("me");

const chat =
document.getElementById("chat");

const msgInput =
document.getElementById("msg");

const sendBtn =
document.getElementById("sendBtn");

let currentUser = "";

const savedUser =
localStorage.getItem("username");

if(savedUser){

auth.style.display = "none";

app.style.display = "block";

currentUser = savedUser;

me.innerText =
"👤 " + currentUser;

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

socket.emit("register", {

username:
usernameInput.value,

password:
passwordInput.value

});

};

logoutBtn.onclick = ()=>{

localStorage.removeItem("username");

location.reload();

};

sendBtn.onclick = ()=>{

if(msgInput.value === "")
return;

socket.emit(
"message",
msgInput.value
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

socket.on("message", data=>{

chat.innerHTML += `

<div class="message">

<b>${data.user}</b>

<br>

${data.text}

</div>

`;

chat.scrollTop =
chat.scrollHeight;

});

socket.on("oldMessages", messages=>{

chat.innerHTML = "";

messages.forEach(data=>{

chat.innerHTML += `

<div class="message">

<b>${data.user}</b>

<br>

${data.text}

</div>

`;

});

});
