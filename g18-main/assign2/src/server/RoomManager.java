package server;

import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;


public class RoomManager {
    private final Map<String, ChatRoom> rooms;
    private final ReadWriteLock roomsLock;

    public RoomManager() {
        this.rooms = new HashMap<>();
        this.roomsLock = new ReentrantReadWriteLock();
    }

    public List<String> getRoomNames() {
        Lock readLock = roomsLock.readLock();
        readLock.lock();

        try {
            return new ArrayList<>(rooms.keySet());
        } finally {
            readLock.unlock();
        }
    }

    public ChatRoom getRoom(String roomName) {
        Lock readLock = roomsLock.readLock();
        readLock.lock();

        try {
            return rooms.get(roomName);
        } finally {
            readLock.unlock();
        }
    }

    public boolean createRoom(String roomName) {
        Lock writeLock = roomsLock.writeLock();
        writeLock.lock();

        try {
            if (rooms.containsKey(roomName)) {
                return false;
            }
            rooms.put(roomName, new ChatRoom(roomName));
            return true;
        } finally {
            writeLock.unlock();
        }
    }
    
    public boolean createAIRoom(String roomName) {
        Lock writeLock = roomsLock.writeLock();
        writeLock.lock();
    
        try {
            if (rooms.containsKey(roomName)) return false;
            rooms.put(roomName, new ChatRoom(roomName, true));
            return true;
        } finally {
            writeLock.unlock();
        }
    }
    
}
