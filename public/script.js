let input = document.getElementById("chat-box");
let messagesContainer = document.getElementById("messages-container")
const ws = new WebSocket('ws://10.109.116.156:8080/');

ws.onopen = ()=>{
  console.log("connected")
  // ws.send("Hello from the client")
}

  ws.onmessage= (event) => {
    console.log("message from server: ", JSON.parse(event.data))
    const data = JSON.parse(event.data)
    const message = document.createElement("div")  
    message.textContent = `${data.id}: ` + `${data.message}`
    messagesContainer.appendChild(message)
  }

input.addEventListener('keydown',(e)=>{
  if(e.key == 'Enter'){
    console.log('submitted', input.value)
    ws.send(input.value)
  }
})
