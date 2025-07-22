import express from 'express';
import { WebSocketServer } from 'ws';
import { readFileSync, writeFile } from 'node:fs';
const app = express();
const port = 8080;


app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile('/home/jonatan/Projects/chat/index.html'); // serve your HTML file
});


const server = app.listen(port, () => {
  console.log(`HTTP server listening on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server }); // use the same server for WS

wss.getUniqueID = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

function loadChatHistory() {
  const data = readFileSync("./data/ChatHistory.json", 'utf8')
  return JSON.parse(data)
}

function writeChatHistory(data) {
  const parsedData = JSON.stringify(data)
  writeFile("./data/ChatHistory.json", parsedData, 'utf8', function(err) { if (err) { console.error(err) } console.log("file written succesfully") })
}


let chatHistory = loadChatHistory()

let clientList = new Set()
console.log("clientList", clientList)

wss.on('connection', (ws) => {
  ws.on('error', console.error);
  ws.id = wss.getUniqueID();

  ws.send(JSON.stringify({ type: "clientList", clients: Array.from(clientList) }))
  ws.send(JSON.stringify({ type: "chatHistory", history: chatHistory }))
  ws.send(JSON.stringify({ type: "loadRooms", history: chatHistory }))


  ws.on('message', function message(data) {
    const dataMessage = JSON.parse(data)

    if (dataMessage.type == "usernameInput") {
      if (clientList.has(dataMessage.username)) {
        ws.send(JSON.stringify({ type: "alreadyExists" }))
        return
      }
      ws.send(JSON.stringify({ type: "loginSuccess" }))
      ws.username = dataMessage.username
      clientList.add(dataMessage.username)
      console.log("clientList", clientList)
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "clientList", clients: Array.from(clientList) }))
        }
      })
    }

    console.log("data got ", dataMessage)

    if (dataMessage.type == "chatMessage") {
      chatHistory[dataMessage.room].messages.push({ username: ws.username, message: dataMessage.message })
      writeChatHistory(chatHistory)
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "chatMessage", room: dataMessage.room, username: ws.username, message: dataMessage.message }))
        }
      })
    }

    if (dataMessage.type == "roomChange") {
      ws.send(JSON.stringify({ type: "roomChange", history: chatHistory }))
    }

    if (dataMessage.type == "addNewRoom") {
      chatHistory[dataMessage.room] = { messages: [] }
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "addNewRoom", room: dataMessage.room }))
        }
      })
    }

    if (dataMessage.type == "userTyping") {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState == WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "userTyping", username: dataMessage.username, userTypingBool: true, room: dataMessage.room }))
        }
      })
    }

    if (dataMessage.type == "notTyping") {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState == WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "userTyping", room: dataMessage.room, userTypingBool: false }))
        }
      })
    }

    ws.on("close", () => {
      clientList.delete(ws.username)
      console.log("clientList", clientList)
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState == WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "clientList", clients: Array.from(clientList) }))
        }
      })
    })

  });

  console.log('Client connected');
})

