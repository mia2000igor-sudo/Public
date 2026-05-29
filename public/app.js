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

const friendsTab =
document.getElementById("friendsTab");

const searchTab =
document.getElementById("searchTab");

const requestsTab =
document.getElementById("requestsTab");

const requestsDiv =
document.getElementById("requests");

const searchInput =
document.getElementById("searchInput");

const searchResults =
document.getElementById("searchResults");

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

let myFriends = [];

function openTab(tab){

friendsTab.style.display =
"none";

searchTab.style.display =
"none";

requestsTab.style.display =
"none";

if(tab === "friends")
friendsTab.style.display =
"block";

if(tab === "search")
searchTab.style.display =
"block";

if(tab === "requests")
requestsTab.style.display =
"block";

}

window.openTab =
openTab;

registerBtn.onclick =
async ()=>{

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

socket.emit(
"register",
{

username:
usernameInput.value,

password:
passwordInput.value,

avatar

}

);

};

loginBtn.onclick =
()=>{

socket.emit(
"login",
{

username:
usernameInput.value,

password:
passwordInput.value

}

);

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
"👤 " + user.username;

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

renderSearch();

});

function renderSearch(){

searchResults.innerHTML =
"";

allUsers.forEach(user=>{

if(
user.username === currentUser
)
return;

searchResults.innerHTML += `

<div class="user">

<img
class="avatar"
src="${user.avatar || ''}"
>

<div>

<b>${user.username}</b>

<br>

${user.status}

</div>

<button
onclick="addFriend('${user.username}')"
>

ADD

</button>

</div>

`;

});

}

function addFriend(user){

socket.emit(
"sendFriendRequest",
{

from:currentUser,
to:user

}

);

alert(
"Friend request sent"
);

}

window.addFriend =
addFriend;

socket.on(
"friendRequests",
requests=>{

requestsDiv.innerHTML =
"";

requests.forEach(r=>{

requestsDiv.innerHTML += `

<div class="user">

<div>

${r.from}

</div>

<button
onclick="acceptFriend('${r.from}')"
>

ACCEPT

</button>

</div>

`;

});

});

function acceptFriend(user){

socket.emit(
"acceptFriend",
{

user1:currentUser,
user2:user

}

);

}

window.acceptFriend =
acceptFriend;

socket.on(
"friends",
friends=>{

myFriends = friends;

renderFriends();

});

function renderFriends(){

friendsTab.innerHTML =
"";

myFriends.forEach(f=>{

const friend =
f.user1 === currentUser
? f.user2
: f.user1;

friendsTab.innerHTML += `

<div
class="user"
onclick="selectFriend('${friend}')"
>

${friend}

</div>

`;

});

}

function selectFriend(friend){

selectedUser = friend;

chatTop.innerText =
"Chat with " + friend;

renderMessages();

}

window.selectFriend =
selectFriend;

sendBtn.onclick =
()=>{

if(
messageInput.value === ""
||
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

}
