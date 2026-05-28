const socket = io();

const chat =
document.getElementById("chat");

const msgInput =
document.getElementById("msg");

const sendBtn =
document.getElementById("sendBtn");

let username = "";

function register(){

const user =
prompt("Create username");

const pass =
prompt("Create password");

socket.emit("register", {

username:user,
password:pass

});

}

function login(){

const user =
prompt("Username");

const pass =
prompt("Password");

socket.emit("login", {

username:user,
password:pass

});

username = user;

}

register();

login();

sendBtn.onclick = ()=>{

if(msgInput.value === "")
return;

socket.emit(
"message",
msgInput.value
);

msgInput.value = "";

};

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

socket.on("registerSuccess", ()=>{

alert("Registration success");

});

socket.on("registerError", err=>{

alert(err);

});

socket.on("loginSuccess", ()=>{

alert("Login success");

});

socket.on("loginError", err=>{

alert(err);

});
