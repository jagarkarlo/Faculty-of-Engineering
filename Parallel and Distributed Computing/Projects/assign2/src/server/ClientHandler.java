package server;

import common.ChatProtocol;
import common.Message;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.util.Arrays;
import java.util.List;

public class ClientHandler {
    private final Socket clientSocket;
    private final UserManager userManager;
    private final RoomManager roomManager;
    private final TokenManager tokenManager;

    private PrintWriter out;
    private BufferedReader in;
    private String username;
    private ChatRoom currentRoom;
    private boolean isTokenAuthenticated = false;

    public ClientHandler(Socket clientSocket, UserManager userManager, RoomManager roomManager, TokenManager tokenManager) {
        this.clientSocket = clientSocket;
        this.userManager = userManager;
        this.roomManager = roomManager;
        this.tokenManager = tokenManager;
    }

    public void handle() {
        try {
            out = new PrintWriter(clientSocket.getOutputStream(), true);
            in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));

            clientSocket.setSoTimeout(60000);

            // Send welcome messages initially
            out.println("Welcome to the chat server");
            out.println("Please login with: LOGIN username password");
            out.println("Or login with token: TOKEN_AUTH token");
            out.println("Or register with: REGISTER username password");

            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                processCommand(inputLine);
            }
        } catch (SocketTimeoutException e) {
            System.out.println("Client timed out: " + clientSocket.getInetAddress());
            try {
                clientSocket.close(); 
            } catch (IOException ex) {
                System.err.println("Error closing timed-out socket: " + ex.getMessage());
            }
        } catch (IOException e) {
            System.out.println("Client disconnected: " + clientSocket.getInetAddress());
        } finally {
            cleanup();
        }
    }

    private void processCommand(String command) {
        String[] parts = ChatProtocol.parseCommand(command);
        if (parts.length == 0) return;

        String cmd = parts[0].toUpperCase();

        switch (cmd) {
            case ChatProtocol.LOGIN:
                handleLogin(parts);
                break;
            case ChatProtocol.REGISTER:
                handleRegister(parts);
                break;
            case ChatProtocol.JOIN:
                handleJoin(parts);
                break;
            case ChatProtocol.CREATE:
                handleCreate(parts);
                break;
            case ChatProtocol.SEND:
                handleSend(parts);
                break;
            case ChatProtocol.LIST:
                handleList();
                break;
            case ChatProtocol.QUIT:
                handleQuit();
                break;
            case ChatProtocol.TOKEN_AUTH:
                handleTokenAuth(parts);
                break;
            case "HELP":
            case "?":
                handleHelp();
                break;
            default:
                // If user is logged in and in a room, treat unknown commands as messages
                if (username != null && currentRoom != null) {
                    // Create a fake "SEND" command structure
                    String[] fakeCommand = {"SEND", command};
                    handleSend(fakeCommand);
                } else {
                    out.println(ChatProtocol.ERROR + " Unknown command");
                }
                break;
        }
    }

    private void handleHelp() {
        out.println("=== AVAILABLE COMMANDS ===");
        out.println("REGISTER <username> <password>  - Register a new user account");
        out.println("LOGIN <username> <password>     - Login with existing account");
        out.println("LIST                            - List all available chat rooms");
        out.println("CREATE <roomname>               - Create a new regular chat room");
        out.println("CREATE ai:<roomname>            - Create a new AI-enabled chat room");
        out.println("JOIN <roomname>                 - Join an existing chat room");
        out.println("TOKEN_AUTH <token>              - Authenticate using a session token");
        out.println("QUIT                            - Exit the chat client");
        out.println("HELP or ?                       - Show this help message");
        out.println("===========================");
    }

    private void handleLogin(String[] parts) {
        if (parts.length < 3) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_INVALID_COMMAND);
            return;
        }

        String username = parts[1];
        String password = parts[2];

        if (userManager.authenticateUser(username, password)) {
            this.username = username;
            String token = tokenManager.generateToken(username);
            out.println(ChatProtocol.LOGIN_SUCCESS);
            out.println("TOKEN " + token);
            handleList();
        } else {
            out.println(ChatProtocol.LOGIN_FAILED + ": Invalid username or password");
        }
    }

    private void handleRegister(String[] parts) {
        if (parts.length < 3) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_INVALID_COMMAND);
            return;
        }

        String username = parts[1];
        String password = parts[2];

        if (userManager.registerUser(username, password)) {
            out.println(ChatProtocol.REGISTER_SUCCESS);
        } else {
            out.println(ChatProtocol.REGISTER_FAILED + ": Username already exists");
        }
    }

    private void handleJoin(String[] parts) {
        if (username == null) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_NOT_LOGGED_IN);
            return;
        }

        if (parts.length < 2) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_INVALID_COMMAND);
            return;
        }

        String roomName = parts[1];

        if (currentRoom != null) {
            currentRoom.removeClient(username);
            currentRoom = null;
        }

        ChatRoom room = roomManager.getRoom(roomName);
        if (room == null) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_ROOM_NOT_EXISTS);
            return;
        }

        currentRoom = room;
        tokenManager.setUserCurrentRoom(username, roomName);
        room.addClient(username, out);
        out.println(ChatProtocol.JOINED + ": " + roomName);

        List<Message> history = room.getMessageHistory();
        for (Message message : history) {
            out.println(message.formatForTransmission());
        }
    }

    private void handleCreate(String[] parts) {
        if (username == null) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_NOT_LOGGED_IN);
            return;
        }

        if (parts.length < 2) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_INVALID_COMMAND);
            return;
        }

        String roomName = parts[1];

        if (roomName.startsWith("ai:")) {
            roomName = roomName.substring(3);
            if (roomManager.createAIRoom(roomName)) {
                out.println(ChatProtocol.ROOM_CREATED + ": " + roomName + " (AI)");
            } else {
                out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_ROOM_EXISTS);
            }
        } else {
            if (roomManager.createRoom(roomName)) {
                out.println(ChatProtocol.ROOM_CREATED + ": " + roomName);
            } else {
                out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_ROOM_EXISTS);
            }
        }
    }

    private void handleSend(String[] parts) {
        if (username == null) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_NOT_LOGGED_IN);
            return;
        }

        if (currentRoom == null) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_NOT_IN_ROOM);
            return;
        }

        if (parts.length < 2) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_INVALID_COMMAND);
            return;
        }

        String message = String.join(" ", Arrays.copyOfRange(parts, 1, parts.length));
        currentRoom.addMessage(username, message);

        if (currentRoom.isAI()) {
            List<Message> history = currentRoom.getMessageHistory(); // Get the message history for context
            StringBuilder context = new StringBuilder();
            for (Message m : history) {
                context.append(m.getSender()).append(": ").append(m.getContent()).append("\n"); // Append each message to context to provide context for the AI
            }

            // Use a virtual thread to handle the AI response asynchronously
            Thread.startVirtualThread(() -> {
                String reply = OllamaClient.askBot(context.toString());
                currentRoom.addMessage("Bot", reply);
            });
        }
    }

    private void handleList() {
        if (username == null) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_NOT_LOGGED_IN);
            return;
        }

        List<String> roomNames = roomManager.getRoomNames();
        out.println(ChatProtocol.ROOMS + " " + String.join(",", roomNames));
    }

    private void handleQuit() {
        out.println(ChatProtocol.GOODBYE);
        cleanup();
        try {
            clientSocket.close(); 
        } catch (IOException e) {
            System.err.println("Error closing client socket: " + e.getMessage());
        }
    }

    // Cleanup method to remove the client from the room and close resources
    private void cleanup() {
        if (currentRoom != null && username != null) {
            currentRoom.removeClient(username);
            currentRoom = null;
        }

        try {
            if (out != null) out.close();
            if (in != null) in.close();
            if (clientSocket != null && !clientSocket.isClosed()) clientSocket.close();
        } catch (IOException e) {
            System.err.println("Error closing connection: " + e.getMessage());
        }
    }

    private void handleTokenAuth(String[] parts) {
        if (parts.length < 2) {
            out.println(ChatProtocol.ERROR + " " + ChatProtocol.ERROR_INVALID_COMMAND);
            return;
        }

        String token = parts[1];

        if (!tokenManager.tokenExists(token)) {
            out.println(ChatProtocol.TOKEN_AUTH_FAILED + ": Token not found.");
            return;
        }

        if (tokenManager.tokenIsExpired(token)) {
            out.println(ChatProtocol.TOKEN_AUTH_FAILED + ": Token expired.");
            return;
        }

        this.username = tokenManager.getUsernameFromToken(token);
        this.isTokenAuthenticated = true;
        out.println(ChatProtocol.TOKEN_AUTH_SUCCESS);
        out.println("Welcome back, " + username + "!");

        String roomName = tokenManager.getUserCurrentRoom(username);
        if (roomName != null) {
            ChatRoom room = roomManager.getRoom(roomName);
            if (room != null) {
                currentRoom = room;
                room.addClient(username, out);
                out.println(ChatProtocol.JOINED + ": " + roomName);

                List<Message> history = room.getMessageHistory();
                for (Message message : history) {
                    out.println(message.formatForTransmission());
                }
                return;
            }
        }

        handleList();
    }
}