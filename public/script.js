const chatInput = document.getElementById("chat-box");
const usernameInput = document.getElementById("username-input")
const dialog = document.getElementById("dialog")
const addNewRoomBtnContainer = document.getElementById("add-new-room-btn-container")
const addNewRoomBtn = document.getElementById("add-new-room-btn")
const roomsDiv = document.getElementsByClassName("rooms-div")[0]
const rooms = roomsDiv.querySelectorAll("*")
let messagesContainer = document.getElementById("messages-container")
const ws = new WebSocket('ws://10.109.69.120:8080/');
let activeRoom = "general"


chatInput.value = ""
usernameInput.value = ""
dialog.showModal()

ws.onopen = () => {
  console.log("connected")
  // ws.send("Hello from the client")
}

ws.onmessage = (event) => {
  console.log("message from server: ", JSON.parse(event.data))
  const data = JSON.parse(event.data)
  if (data.type == "chatMessage") {
    const message = document.createElement("div")
    message.textContent = `${data.username}: ` + `${data.message}`
    messagesContainer.appendChild(message)
  }

  if (data.type == "chatHistory") {
    for (const message of data.history[activeRoom].messages) {
      const div = document.createElement('div')
      div.textContent = `${message.username}: ` + `${message.message}`
      messagesContainer.appendChild(div)
    }
  }

  if (data.type == "addNewRoom") {
    const newRoomBtn = document.createElement('button')
    newRoomBtn.classList.add("room-btn")
    newRoomBtn.innerHTML = data.room
    roomsDiv.append(newRoomBtn)
    addNewRoomBtnContainer.innerHTML = ""
    addNewRoomBtnContainer.appendChild(addNewRoomBtn)
    console.log("addNewRoomBtn", addNewRoomBtn)
  }

}


chatInput.addEventListener('keydown', (e) => {
  if (e.key == 'Enter') {
    ws.send(JSON.stringify({ type: "chatMessage", room: activeRoom, username: ws.username, message: chatInput.value }))
    chatInput.value = ""
  }
})

usernameInput.addEventListener('keydown', (e) => {
  if (e.key == 'Enter') {
    ws.send(JSON.stringify({ type: "usernameInput", username: usernameInput.value }))
    dialog.close()
  }
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



rooms.forEach((room) => {
  room.addEventListener("click", () => {
    ws.send(JSON.stringify({ type: "roomChange", room: room.textContent }))
    messagesContainer.innerHTML = ""
    setActiveRoom(room)
  })
})


function getActiveRoom() {
  return document.querySelector('.active-room')
}

function setActiveRoom(newActiveRoom) {
  if (getActiveRoom()) {
    getActiveRoom().classList.remove("active-room")
  }
  newActiveRoom.classList.add("active-room")
}




// function newRoom(name){
//   if(!localStorage.getItem(name)){
//   localStorage.setItem(name,JSON.stringify({messages:[]}))
//   }
// }
// newRoom("general")
//
// function writeChat(roomName, username, message){
//   console.log("dasd",localStorage.getItem(roomName))
//   let room = JSON.parse(localStorage.getItem(roomName))
//   room.messages.push({username: username, message: message})
//   localStorage.setItem(roomName,JSON.stringify(room))
//   console.log("room", room)
// }
// writeChat("general", "jonatan","hallo")
