const chatInput = document.getElementById("chat-box");
const usernameInput = document.getElementById("username-input")
const dialog = document.getElementById("dialog")
let messagesContainer = document.getElementById("messages-container")
const ws = new WebSocket('ws://10.109.69.84:8080/');


chatInput.value= ""
usernameInput.value=""
dialog.showModal()

ws.onopen = ()=>{
  console.log("connected")
  // ws.send("Hello from the client")
}

  ws.onmessage= (event) => {
    console.log("message from server: ", JSON.parse(event.data))
    const data = JSON.parse(event.data)
    if(data.type == "chatMessage"){
    const message = document.createElement("div")  
    message.textContent = `${data.username}: ` + `${data.message}`
    messagesContainer.appendChild(message)
    }

    if(data.type == "chatHistory"){
for(const message of data.history.general.messages){
  const div = document.createElement('div')
  div.textContent = `${message.username}: ` + `${message.message}`
  messagesContainer.appendChild(div)
}
      }
    }
  

chatInput.addEventListener('keydown',(e)=>{
  if(e.key == 'Enter'){
    console.log('submitted', chatInput.value)

    ws.send(JSON.stringify({type:"chatMessage", username: ws.username,message:chatInput.value})) 

    // ws.send(JSON.stringify({type:"chatMessage", chat: {roomName: "general", messages: [{username: ws.username,message:chatInput.value}]}})) 

chatInput.value = ""
  }
})

usernameInput.addEventListener('keydown', (e)=>{
  if(e.key == 'Enter'){
    ws.send(JSON.stringify({type:"usernameInput", username:usernameInput.value}))
  dialog.close()}
})

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
