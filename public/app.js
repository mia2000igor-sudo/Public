const socket = io();

const auth = document.getElementById("auth");
const app = document.getElementById("app");

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

const requestsTab =
document.getElementById("requestsTab");

const searchInput =
document.getElementById("searchInput");

const searchResults =
document.getElementById("searchResults");

const chat =
document.getElementById("chat");

const sendBtn =
document.getElementById("sendBtn");

const messageInput =
document.getElementById("messageInput");

const chatTop =
document.getElementById("chatTop");

let currentUser = null;
let currentChat = null;

app.style.display = "none";

function showTab(tab) {

  friendsTab.style.display = "none";
  searchTab.style.display = "none";
  requestsTab.style.display = "none";

  if (tab === "friends") {
    friendsTab.style.display = "block";
  }

  if (tab === "search") {
    searchTab.style.display = "block";
  }

  if (tab === "requests") {
    requestsTab.style.display = "block";
  }

}

showTab("friends");

async function uploadAvatar() {

  const file =
  avatarInput.files[0];

  if (!file) {
    return "";
  }

  const formData =
  new FormData();

  formData.append(
    "avatar",
    file
  );

  const res = await fetch(
    "/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data =
  await res.json();

  return data.image;

}

registerBtn.onclick =
async () => {

  const avatar =
  await uploadAvatar();

  const res = await fetch(
    "/register",
    {
      method: "POST",

      headers: {
        "Content-Type":
        "application/json"
      },

      body: JSON.stringify({
        username:
        usernameInput.value,

        password:
        passwordInput.value,

        avatar
      })

    }
  );

  const data =
  await res.json();

  if (data.error) {
    return alert(data.error);
  }

  alert("Account created");

};

loginBtn.onclick =
async () => {

  const res = await fetch(
    "/login",
    {
      method: "POST",

      headers: {
        "Content-Type":
        "application/json"
      },

      body: JSON.stringify({
        username:
        usernameInput.value,

        password:
        passwordInput.value
      })

    }
  );

  const data =
  await res.json();

  if (data.error) {
    return alert(data.error);
  }

  currentUser = data;

  auth.style.display =
  "none";

  app.style.display =
  "flex";

  me.innerHTML = `
  <img
  src="${data.avatar}"
  class="avatar"
  >

  ${data.username}

  <div class="status">
  ${data.status}
  </div>
  `;

  loadFriends();
  loadRequests();

};

async function loadFriends() {

  friendsTab.innerHTML = "";

  const res = await fetch(
    "/users"
  );

  const users =
  await res.json();

  const meUser =
  users.find(
    u =>
    u.username ===
    currentUser.username
  );

  meUser.friends.forEach(
    friend => {

      const user =
      users.find(
        u =>
        u.username === friend
      );

      const div =
      document.createElement(
        "div"
      );

      div.className =
      "friend";

      div.innerHTML = `
      <img
      src="${user.avatar}"
      class="smallAvatar"
      >

      <div>
      <b>${user.username}</b>

      <div>
      ${user.status}
      </div>
      </div>
      `;

      div.onclick = () => {
        openChat(friend);
      };

      friendsTab.appendChild(
        div
      );

    }
  );

}

async function loadRequests() {

  requestsTab.innerHTML = "";

  const res = await fetch(
    "/users"
  );

  const users =
  await res.json();

  const meUser =
  users.find(
    u =>
    u.username ===
    currentUser.username
  );

  meUser.requests.forEach(
    req => {

      const div =
      document.createElement(
        "div"
      );

      div.className =
      "request";

      div.innerHTML = `
      <b>${req}</b>

      <button>
      ACCEPT
      </button>
      `;

      div.querySelector(
        "button"
      ).onclick =
      async () => {

        await fetch(
          "/accept-friend",
          {
            method: "POST",

            headers: {
              "Content-Type":
              "application/json"
            },

            body: JSON.stringify({
              user:
              currentUser.username,

              friend: req
            })

          }
        );

        loadRequests();
        loadFriends();

      };

      requestsTab.appendChild(
        div
      );

    }
  );

}

searchInput.oninput =
async () => {

  searchResults.innerHTML = "";

  const res = await fetch(
    "/users"
  );

  const users =
  await res.json();

  users.forEach(user => {

    if (
      user.username
      .toLowerCase()
      .includes(
        searchInput.value
        .toLowerCase()
      )
      &&
      user.username !==
      currentUser.username
    ) {

      const div =
      document.createElement(
        "div"
      );

      div.className =
      "searchUser";

      div.innerHTML = `
      <img
      src="${user.avatar}"
      class="smallAvatar"
      >

      <div>
      <b>${user.username}</b>

      <div>
      ${user.status}
      </div>
      </div>

      <button>
      ADD
      </button>
      `;

      div.querySelector(
        "button"
      ).onclick =
      async () => {

        await fetch(
          "/add-friend",
          {
            method: "POST",

            headers: {
              "Content-Type":
              "application/json"
            },

            body: JSON.stringify({
              from:
              currentUser.username,

              to:
              user.username
            })

          }
        );

        alert(
          "Friend request sent"
        );

      };

      searchResults.appendChild(
        div
      );

    }

  });

};

async function openChat(friend) {

  currentChat = friend;

  chatTop.innerText =
  "Chat with " + friend;

  loadMessages();

}

async function loadMessages() {

  const res = await fetch(
    "/messages"
  );

  const messages =
  await res.json();

  chat.innerHTML = "";

  messages.forEach(msg => {

    if (

      (
        msg.from ===
        currentUser.username

        &&

        msg.to ===
        currentChat
      )

      ||

      (
        msg.from ===
        currentChat

        &&

        msg.to ===
        currentUser.username
      )

    ) {

      const div =
      document.createElement(
        "div"
      );

      div.className =
      "message";

      div.innerHTML = `
      <b>${msg.from}</b>

      <div>
      ${msg.text}
      </div>
      `;

      chat.appendChild(div);

    }

  });

}

sendBtn.onclick =
async () => {

  if (!currentChat) {
    return;
  }

  await fetch(
    "/send-message",
    {
      method: "POST",

      headers: {
        "Content-Type":
        "application/json"
      },

      body: JSON.stringify({
        from:
        currentUser.username,

        to:
        currentChat,

        text:
        messageInput.value
      })

    }
  );

  messageInput.value = "";

  loadMessages();

};

socket.on(
  "newMessage",
  loadMessages
);
