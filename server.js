const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs')





const port = process.env.PORT || 8080


// Create an HTTP server
const httpServer = http.createServer((req, res) => {
    if (process.env.NODE_ENV === 'production') {
      // Serve static files from the React app's build directory
      const filePath = path.join(__dirname, 'client', 'build', req.url === '/' ? 'index.html' : req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    } else {
      res.writeHead(200);
      res.end('Development server - No static files served');
    }
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