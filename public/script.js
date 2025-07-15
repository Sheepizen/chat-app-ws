const chatInput = document.getElementById("chat-box");
const usernameInput = document.getElementById("username-input")
const dialog = document.getElementById("dialog")
let messagesContainer = document.getElementById("messages-container")
const ws = new WebSocket('ws://10.109.116.156:8080/');

ws.onopen = ()=>{
  console.log("connected")
  // ws.send("Hello from the client")
}
dialog.showModal()

  ws.onmessage= (event) => {
    console.log("HAHAH", event.data)
    console.log("message from server: ", JSON.parse(event.data))
    const data = JSON.parse(event.data)
    const message = document.createElement("div")  
    message.textContent = `${data.username}: ` + `${data.message}`
    messagesContainer.appendChild(message)
  }

chatInput.addEventListener('keydown',(e)=>{
  if(e.key == 'Enter'){
    console.log('submitted', chatInput.value)

    ws.send(JSON.stringify({type:"chatMessage", username: ws.username,message:chatInput.value}))  }
})

usernameInput.addEventListener('keydown', (e)=>{
  if(e.key == 'Enter'){
    ws.send(JSON.stringify({type:"usernameInput", username:usernameInput.value}))
  dialog.close()}
})

