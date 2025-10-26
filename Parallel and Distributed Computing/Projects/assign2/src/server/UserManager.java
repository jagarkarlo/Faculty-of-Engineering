package server;

import java.io.*;
import java.util.*;
import java.util.concurrent.locks.*;

public class UserManager {
    private final Map<String, String> users;
    private final ReadWriteLock usersLock;
    private final String usersFile;

    public UserManager(String usersFile) {
        this.users = new HashMap<>();
        this.usersLock = new ReentrantReadWriteLock();
        this.usersFile = usersFile;

        loadUsers();

        if (users.isEmpty()) {
            registerUser("test", "test123");
        }
    }

    private void loadUsers() {
        Lock writeLock = usersLock.writeLock();
        writeLock.lock();

        try {
            File file = new File(usersFile);
            if (!file.exists()) {
                return;
            }

            try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String[] parts = line.split(":", 2);
                    if (parts.length == 2) {
                        users.put(parts[0], parts[1]);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Error loading users: " + e.getMessage());
        } finally {
            writeLock.unlock();
        }
    }

    private void saveUsers() {
        Lock readLock = usersLock.readLock();
        readLock.lock();

        try {
            try (PrintWriter writer = new PrintWriter(new FileWriter(usersFile))) {
                for (Map.Entry<String, String> entry : users.entrySet()) {
                    writer.println(entry.getKey() + ":" + entry.getValue());
                }
            }
        } catch (IOException e) {
            System.err.println("Error saving users: " + e.getMessage());
        } finally {
            readLock.unlock();
        }
    }

    public boolean authenticateUser(String username, String password) {
        Lock readLock = usersLock.readLock();
        readLock.lock();

        try {
            return users.containsKey(username) && users.get(username).equals(password);
        } finally {
            readLock.unlock();
        }
    }

    public boolean registerUser(String username, String password) {
        Lock writeLock = usersLock.writeLock();
        writeLock.lock();

        try {
            if (users.containsKey(username)) {
                return false;
            }
            users.put(username, password);
            saveUsers();
            return true;
        } finally {
            writeLock.unlock();
        }
    }
}
