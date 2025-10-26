package server;

import common.Message;


import java.io.*;
import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;


public class ChatRoom {
    private final String name;
    private final Map<String, PrintWriter> clients;
    private final List<Message> messageHistory;
    private final ReadWriteLock clientsLock; // Lock for clients map to allow concurrent access
    private final ReadWriteLock historyLock; // Lock for message history so it can be accessed concurrently
    private final int MAX_HISTORY_SIZE = 100;
    private final boolean isAI;


    public ChatRoom(String name, boolean isAI) {
        this.name = name;
        this.isAI = isAI;
        this.clients = new HashMap<>();
        this.messageHistory = new ArrayList<>();
        this.clientsLock = new ReentrantReadWriteLock();
        this.historyLock = new ReentrantReadWriteLock();
    }

    public boolean isAI() {
        return isAI;
    }

    public ChatRoom(String name) {
        this(name, false);
    }

    public void addClient(String username, PrintWriter clientOut) {
        Lock clientsWriteLock = clientsLock.writeLock(); // Use write lock for modifying the clients map
        clientsWriteLock.lock();

        try {
            clients.put(username, clientOut);
        } finally {
            clientsWriteLock.unlock();
        }

        Message joinMessage = new Message("System", username + " " + "has joined the room", name, Message.MessageType.SYSTEM);
        broadcastMessage(joinMessage); // Broadcast the join message to all clients
    }

    public void removeClient(String username) {
        Lock clientsWriteLock = clientsLock.writeLock(); // Use write lock for modifying the clients map
        clientsWriteLock.lock();

        try {
            clients.remove(username);

            Message leaveMessage = new Message("System", username + "has left the room", name, Message.MessageType.SYSTEM);
            broadcastMessage(leaveMessage); // Broadcast the leave message to all clients
        } finally {
            clientsWriteLock.unlock();
        }
    }

    public void addMessage(String sender, String content) {
        Message message = new Message(sender, content, name, Message.MessageType.CHAT);

        Lock historyWriteLock = historyLock.writeLock(); // Use write lock for modifying the message history
        historyWriteLock.lock();

        try {
            messageHistory.add(message);

            if (messageHistory.size() > MAX_HISTORY_SIZE) {
                messageHistory.remove(0);
            }
        } finally {
            historyWriteLock.unlock();
        }

        broadcastMessage(message); // Broadcast the message to all clients
    }

    private void broadcastMessage(Message message) {
        String formattedMessage = message.formatForTransmission();

        Lock clientsReadLock = clientsLock.readLock(); // Use read lock for reading the clients map
        clientsReadLock.lock();

        try {
            for (PrintWriter clientOut : clients.values()) {
                Thread.startVirtualThread(() -> clientOut.println(formattedMessage)); // Send the message to each client asynchronously
            }
        } finally {
            clientsReadLock.unlock();
        }
    }

    public List<Message> getMessageHistory() {
        Lock historyReadLock = historyLock.readLock();
        historyReadLock.lock();

        try {
            return new ArrayList<>(messageHistory);
        } finally {
            historyReadLock.unlock();
        }
    }
}
