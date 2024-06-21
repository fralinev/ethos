const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs')





const port = process.env.PORT || 8080


const httpServer = http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
    console.log('filePath', filePath);
  
    fs.readFile(filePath, (error, data) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // If the file is not found, serve index.html for client-side routing
          fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err, data) => {
            if (err) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(err));
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(data);
            }
          });
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(error));
        }
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  });

const webSocketServer = new WebSocket.Server({ server: httpServer });
const users = new Map();

webSocketServer.on('connection', socket => {
    console.log('Client connected');

    socket.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'connect') {
            users.set(socket, parsedMessage.user);
            broadcastUserList();
        } else if (parsedMessage.type === 'message') {
            broadcastMessage(parsedMessage);
        } else if (parsedMessage.type === 'disconnect') {
            for (let [socket, user] of users) {
                if (user === parsedMessage.user) {
                    users.delete(socket);
                    broadcastUserList()
                    break; // Assuming usernames are unique, exit the loop after removing
                }
            }
        }



    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcastUserList() {
    const userList = Array.from(users.values());
    const message = JSON.stringify({ type: 'userList', users: userList });

    webSocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function broadcastMessage(message) {
    const jsonMessage = JSON.stringify(message);

    webSocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(jsonMessage);
        }
    });
}

httpServer.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });