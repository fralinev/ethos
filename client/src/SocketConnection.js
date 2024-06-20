

export default class SocketConnection {
    constructor(callbacks) {
        this.socket = null;
        this.user = null;
        this.message = null;
        this.callbacks = callbacks;
        this.close = this.close.bind(this)
    }

    connect(user) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.warn('WebSocket is already connected.');
            return;
        }
        const isLocalhost = window.location.hostname === 'localhost';
        const wsProtocol = isLocalhost ? 'ws' : 'wss';
        const wsHost = isLocalhost ? 'localhost:8080' : window.location.host;
        const wsUrl = `${wsProtocol}://${wsHost}`;
        this.user = user
        this.socket = new WebSocket(wsUrl);
        this.socket.onopen = () => {
            console.log(`WebSocket connection established for ${user}`)
            this.sendConnectMessage();
            window.addEventListener('beforeunload', this.close)

        }
        this.socket.onmessage = (event) => {
            this.handleMessage(event)
        }
        this.socket.onclose = (event) => {
            console.log('WebSocket connection closed:', event.reason);
        };
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleMessage(event) {

        const message = JSON.parse(event.data);
        console.log("check message", message)
        if (message.type === 'userList') {
            return this.callbacks.updateUserList(message.users)
        }
        this.callbacks.addMessage(message)

    }

    sendMessage(body) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const jsonMessage = {
                body,
                type: 'message',
                user: this.user,
                dateSent: new Date().toISOString()
            }
            this.socket.send(JSON.stringify(jsonMessage));
        } else {
            console.warn('WebSocket is not open. Message not sent.');
        }
    }

    sendConnectMessage() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const connectMessage = {
                type: 'connect',
                user: this.user
            };
            this.socket.send(JSON.stringify(connectMessage));
        } else {
            console.warn('WebSocket is not open. Message not sent.');
        }
    }
    sendDisconnectMessage() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const disconnectMessage = {
                type: 'disconnect',
                user: this.user
            };
            this.socket.send(JSON.stringify(disconnectMessage));
        } else {
            console.warn('WebSocket is already open. Message not sent.');
        }

    }

    close(event) {
        console.log("check close socket", event)
        if (this.socket) {
            this.sendDisconnectMessage();

            this.socket.close();
        }
        this.cleanup();
    }

    cleanup() {
        // Remove the event listener when the connection is closed
        window.removeEventListener('beforeunload', this.close);
    }
}

export const socket = new SocketConnection()