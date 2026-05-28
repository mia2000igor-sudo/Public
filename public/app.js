const socket = io();

const username =
prompt("Your name");

const chat =
document.getElementById("chat");

const msgInput =
document.getElementById("msg");

const sendBtn =
document.getElementById("sendBtn");

socket.emit("join", username);

sendBtn.onclick = ()=>{

if(msgInput.value === "")
return;

socket.emit("message", {

user: username,
text: msgInput.value

});

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
