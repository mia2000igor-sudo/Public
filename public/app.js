const socket = io();

const username =
prompt("Your name");

const chat =
document.getElementById("chat");

const usersDiv =
document.getElementById("users");

const msgInput =
document.getElementById("msg");

const sendBtn =
document.getElementById("sendBtn");

let selectedUser = null;

socket.emit("join", username);

sendBtn.onclick = ()=>{

if(msgInput.value === "")
return;

if(selectedUser){

socket.emit("privateMessage", {

to: selectedUser,
text: msgInput.value,
user: username

});

chat.innerHTML += `

<div class="message">
<b>You → ${selectedUser}</b><br>
${msgInput.value}
</div>

`;

}

msgInput.value = "";

};

socket.on("privateMessage", data=>{

chat.innerHTML += `

<div class="message">

<b>${data.user}</b><br>

${data.text}

</div>

`;

chat.scrollTop =
chat.scrollHeight;

});

socket.on("users", users=>{

usersDiv.innerHTML = "";

users.forEach(user=>{

if(user === username)
return;

usersDiv.innerHTML += `

<div class="user"
onclick="selectUser('${user}')">

🟢 ${user}

</div>

`;

});

});

function selectUser(user){

selectedUser = user;

chat.innerHTML += `

<div class="message">

<b>SYSTEM</b><br>

Chat with ${user}

</div>

`;

}
