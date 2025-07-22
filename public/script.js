const chatInput = document.getElementById("chat-box");
const usernameInput = document.getElementById("username-input")
const dialog = document.getElementById("dialog")
const addNewRoomBtnContainer = document.getElementById("add-new-room-btn-container")
const addNewRoomBtn = document.getElementById("add-new-room-btn")
const roomsDiv = document.getElementsByClassName("rooms-div")[0]
const rooms = roomsDiv.querySelectorAll("*")
let messagesContainer = document.getElementById("messages-container")
const usersContainer = document.getElementById("users-container")
const ws = new WebSocket(`ws://${window.location.hostname}:8080/`);
setActiveRoom(rooms[0])

chatInput.value = ""
usernameInput.value = ""
dialog.showModal()

ws.onopen = () => {
  console.log("connected")
  // ws.send("Hello from the client")
  rooms.forEach((room) => {
    room.addEventListener("click", () => {
      ws.send(JSON.stringify({ type: "roomChange", room: room.textContent }))
      messagesContainer.innerHTML = ""
      setActiveRoom(room)
    })
  })
}


ws.onmessage = (event) => {
  console.log("message from server: ", JSON.parse(event.data))
  const data = JSON.parse(event.data)

  if (data.type == "alreadyExists") {
    const warningElem = document.getElementById("already-exists-warning")
    if (warningElem) {
      return
    }
    const div = document.createElement("div")
    div.id = "already-exists-warning"
    div.textContent = "user already exists. Please try another username"
    div.style.color = "red";
    dialog.appendChild(div)
  }


  if (data.type == "loginSuccess") {
    dialog.close()
  }


  if (data.type == "clientList") {
    usersContainer.innerHTML = ""
    data.clients.forEach((client) => {
      const div = document.createElement("div")
      div.textContent = client
      div.classList.add("client")
      usersContainer.append(div)

    })
  }

  if (data.type == "chatMessage") {
    if (getActiveRoom().innerHTML == data.room) {
      const message = document.createElement("div")
      message.textContent = `${data.username}: ` + `${data.message}`
      messagesContainer.appendChild(message)
    }
  }

  if (data.type == "chatHistory") {
    for (const message of data.history[getActiveRoom().innerHTML].messages) {
      const div = document.createElement('div')
      div.textContent = `${message.username}: ` + `${message.message}`
      messagesContainer.appendChild(div)
    }
  }

  if (data.type == "loadRooms") {
    const roomnames = []
    for (const [key, value] of Object.entries(rooms)) {
      roomnames.push(value.innerHTML)
    }
    for (const room of Object.entries(data.history)) {
      const roomname = room[0]
      if (roomnames.includes(roomname)) {
        continue
      }
      appendRoom(roomname)
    }
  }

  if (data.type == "addNewRoom") {
    appendRoom(data.room)
  }

  if (data.type == "roomChange") {
    for (const message of data.history[getActiveRoom().innerHTML].messages) {
      const div = document.createElement('div')
      div.textContent = `${message.username}: ` + `${message.message}`
      messagesContainer.appendChild(div)
    }
  }

  if (data.type == "userTyping" && data.room == getActiveRoom().innerHTML) {
    const typingElem = document.querySelector("#user-typing")
    if (typingElem) {
      typingElem.remove()
    }
    if (data.userTypingBool) {
      const div = document.createElement('div')
      div.id = "user-typing"
      div.textContent = `${data.username} is typing...`
      div.style.color = "grey"
      messagesContainer.appendChild(div)
      return
    }

  }

}


usernameInput.addEventListener('keydown', (e) => {
  if (e.key == 'Enter') {
    ws.username = usernameInput.value
    ws.send(JSON.stringify({ type: "usernameInput", username: usernameInput.value }))
  }
})

let typingController = { cancelled: false };

function delay(t) {
  return new Promise(resolve => setTimeout(resolve, t));
}

chatInput.addEventListener('keydown', async (e) => {
  const allowedKeys = /^[a-zA-Z0-9äöüÄÖÜ\-#+!"§\$%&\/()=\?`.:;,<>^°]$/;
  if (e.key == 'Enter') {
    ws.send(JSON.stringify({ type: "chatMessage", room: getActiveRoom().innerHTML, username: ws.username, message: chatInput.value }))
    ws.send(JSON.stringify({ type: "notTyping", room: getActiveRoom().innerHTML }))
    chatInput.value = ""
    return
  }
  if (e.key == 'Backspace') {
    ws.send(JSON.stringify({ type: "notTyping", room: getActiveRoom().innerHTML }))
    return
  }

  if (allowedKeys.test(e.key)) {
    ws.send(JSON.stringify({ type: "userTyping", username: ws.username, room: getActiveRoom().innerHTML }))

    typingController.cancelled = true
    const controller = { cancelled: false }
    typingController = controller
    await delay(1500)

    if (!controller.cancelled) {
      ws.send(JSON.stringify({
        type: "notTyping",
        username: ws.username,
        room: getActiveRoom().innerHTML
      }));
    }
    return
  }
  return
})

function addNewRoom() {
  addNewRoomBtnContainer.innerHTML = ""
  const newRoomInput = document.createElement('input')
  newRoomInput.setAttribute("placeholder", "input roomname")
  newRoomInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
      ws.send(JSON.stringify({ type: "addNewRoom", room: newRoomInput.value }))
    }
  })
  addNewRoomBtnContainer.append(newRoomInput)
}

addNewRoomBtn.addEventListener('click', () => {
  addNewRoom()
})

function appendRoom(roomname) {
  const newRoomBtn = document.createElement('button')
  newRoomBtn.classList.add("room-btn")
  newRoomBtn.innerHTML = roomname
  newRoomBtn.addEventListener("click", () => {
    ws.send(JSON.stringify({ type: "roomChange", room: newRoomBtn.textContent }))
    messagesContainer.innerHTML = ""
    setActiveRoom(newRoomBtn)
  })
  roomsDiv.append(newRoomBtn)
  addNewRoomBtnContainer.innerHTML = ""
  addNewRoomBtnContainer.appendChild(addNewRoomBtn)
}

function getActiveRoom() {
  return document.querySelector('.active-room')
}

function setActiveRoom(newActiveRoom) {
  if (getActiveRoom()) {
    getActiveRoom().classList.remove("active-room")
  }
  newActiveRoom.classList.add("active-room")
}

