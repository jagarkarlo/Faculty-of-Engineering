package test;

import java.io.*;
import java.net.Socket;
import java.util.Scanner;
import java.util.concurrent.*;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

public class TestClient {
    private static volatile boolean shouldReconnect = false;
    private static final BlockingQueue<String> inputQueue = new LinkedBlockingQueue<>();
    private static PrintWriter out;
    private static BufferedReader in;
    private static String lastSendCommand = null;
    private static String lastToken = null;
    private static boolean isReconnecting = false;

    static {
        System.setProperty("javax.net.ssl.trustStore", "assign2/data/truststore.jks");
        System.setProperty("javax.net.ssl.trustStorePassword", "password");
    }

    public static void main(String[] args) {
        showInstructions();
        startInputThread();

        Thread statusThread = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(60000);
                    if (shouldReconnect) {
                        System.out.println("\nConnection lost.");
                        System.out.print("Reconnect using TOKEN_AUTH? (y/n): ");
                        System.out.flush();
                        shouldReconnect = false;
                    }
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
        statusThread.setDaemon(true);
        statusThread.start();

        try {
            SSLSocket socket = connectToServer();
            handleSocket(socket);
        } catch (Exception e) {
            System.err.println("Fatal error: " + e.getMessage());
        }
    }

    private static void showInstructions() {
        System.out.println("=== CHAT CLIENT INSTRUCTIONS ===");
        System.out.println("Available commands:");
        System.out.println("  REGISTER <username> <password>  - Register a new user account");
        System.out.println("  LOGIN <username> <password>     - Login with existing account");
        System.out.println("  LIST                            - List all available chat rooms");
        System.out.println("  CREATE <roomname>               - Create a new regular chat room");
        System.out.println("  CREATE ai:<roomname>            - Create a new AI-enabled chat room");
        System.out.println("  JOIN <roomname>                 - Join an existing chat room");
        System.out.println("  TOKEN_AUTH <token>              - Authenticate using a session token");
        System.out.println("  QUIT                            - Exit the chat client");
        System.out.println();
        System.out.println("Notes:");
        System.out.println("- You must LOGIN or REGISTER before using other commands");
        System.out.println("- You must JOIN a room before you can SEND messages");
        System.out.println("- AI rooms will respond to your messages automatically");
        System.out.println("- Your session token is provided after successful login");
        System.out.println("- Tokens can be used to reconnect if connection is lost");
        System.out.println("=================================");
        System.out.println();
    }

    private static SSLSocket connectToServer() throws IOException {
        SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
        SSLSocket socket = (SSLSocket) factory.createSocket("localhost", 8888);
        socket.setEnabledProtocols(new String[]{"TLSv1.3", "TLSv1.2"});
        // Set client-side socket timeout to 5 minutes (300,000 milliseconds)
        socket.setSoTimeout(300000);
        out = new PrintWriter(socket.getOutputStream(), true);
        in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        startReceiveThread(in);
        return socket;
    }

    private static void handleSocket(SSLSocket socket) throws Exception {
        System.out.println("Connected to server. Enter commands:");

        while (true) {
            String command = inputQueue.take(); // Wait for user input

            if (command.equalsIgnoreCase("y")) {
                System.out.print("Enter your token: ");
                System.out.flush();
                String token = inputQueue.take();

                isReconnecting = true; // Flag to ignore welcome messages
                socket = connectToServer(); // reconnect
                out = new PrintWriter(socket.getOutputStream(), true);
                in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                startReceiveThread(in);  // restart receiver thread

                // Small delay to let welcome messages be received and ignored
                Thread.sleep(200);
                
                out.println("TOKEN_AUTH " + token);

                if (lastSendCommand != null) {
                    Thread.sleep(100);
                    out.println(lastSendCommand);
                    lastSendCommand = null;
                }
                
                // Reset flag after a short delay
                Thread.sleep(300);
                isReconnecting = false;
                continue;
            }

            if (command.equalsIgnoreCase("n")) {
                System.out.println("Exiting.");
                break;
            }

            if (command.equalsIgnoreCase("help") || command.equalsIgnoreCase("?")) {
                showInstructions();
                continue;
            }

            out.println(command);

            if (command.startsWith("SEND ")) {
                lastSendCommand = command;
            }

            if (command.equals("QUIT")) break;
        }

        cleanup(socket);
    }

    private static void startReceiveThread(BufferedReader in) {
        Thread receiveThread = new Thread(() -> {
            try {
                String line;
                while ((line = in.readLine()) != null) {
                    // Filter out welcome messages during reconnection
                    if (isReconnecting && (
                        line.contains("Welcome to the chat server") ||
                        line.contains("Please login with") ||
                        line.contains("Or register with"))) {
                        continue; // Skip these messages during reconnection
                    }
                    
                    System.out.println("SERVER: " + line);

                    if (line.startsWith("TOKEN ")) {
                        lastToken = line.substring("TOKEN ".length());
                        System.out.println(">>> Your session token has been saved for reconnection <<<");
                    }
                }
                shouldReconnect = true;
            } catch (IOException e) {
                shouldReconnect = true;
            }
        });
        receiveThread.setDaemon(true);
        receiveThread.start();
    }

    private static void startInputThread() {
        Thread inputThread = new Thread(() -> {
            Scanner scanner = new Scanner(System.in);
            while (true) {
                String input = scanner.nextLine();
                inputQueue.offer(input);
            }
        });
        inputThread.setDaemon(true);
        inputThread.start();
    }

    private static void cleanup(Socket socket) {
        try {
            if (in != null) in.close();
            if (out != null) out.close();
            if (socket != null && !socket.isClosed()) socket.close();
        } catch (IOException e) {
            System.err.println("Error closing socket: " + e.getMessage());
        }
    }
}