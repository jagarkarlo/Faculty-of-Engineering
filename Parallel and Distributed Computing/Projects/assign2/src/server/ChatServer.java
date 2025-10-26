package server;

import java.io.*;
import java.net.*;
import java.util.Timer;
import java.util.TimerTask;

import javax.net.ssl.SSLServerSocket;
import javax.net.ssl.SSLServerSocketFactory;

public class ChatServer {
    private static final int PORT = 8888;
    private final UserManager userManager;
    private final RoomManager roomManager;
    private final TokenManager tokenManager;

    public ChatServer() {
        userManager = new UserManager("assign2/data/users.txt");
        roomManager = new RoomManager();
        tokenManager = new TokenManager();

        roomManager.createRoom("General");
    }

    public void start() {
        // Periodic cleanup every 5 minutes
        Timer timer = new Timer(true);
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                tokenManager.cleanupExpiredTokens();
            }
        }, 0, 5 * 60 * 1000); // every 5 minutes

        // Create SSL server socket for secure communication
        SSLServerSocketFactory sslServerSocketFactory = (SSLServerSocketFactory) SSLServerSocketFactory.getDefault();

        try (SSLServerSocket serverSocket = (SSLServerSocket) sslServerSocketFactory.createServerSocket(PORT)) {
            System.out.println("Chat server started on port " + PORT);

            // Enable only the TLS protocol
            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("New client connected: " + clientSocket.getInetAddress());

                // Handle each client connection in a virtual thread
                Thread.startVirtualThread(() -> {
                    ClientHandler handler = new ClientHandler(clientSocket, userManager, roomManager, tokenManager);
                    handler.handle();
                });
            }
        } catch (IOException e) {
            System.err.println("Chat server failed to start on port " + PORT);
        }
    }

    static {
        System.setProperty("javax.net.ssl.keyStore", "assign2/data/keystore.jks");
        System.setProperty("javax.net.ssl.keyStorePassword", "password");
    }

    public static void main(String[] args) {
        File dataDir = new File("data");
        if (!dataDir.exists()) {
            dataDir.mkdir();
        }

        ChatServer server = new ChatServer();
        server.start();
    }
}
