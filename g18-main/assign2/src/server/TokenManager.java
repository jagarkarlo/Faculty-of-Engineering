package server;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

public class TokenManager {
    private final Map<String, ExpirableToken> tokenMap = new HashMap<>();
    private final Map<String, String> userToToken = new HashMap<>();
    private final Map<String, String> userToRoom = new HashMap<>();
    private final ReentrantLock lock = new ReentrantLock();

    public String generateToken(String username) {
        lock.lock();
        try {
            String token = UUID.randomUUID().toString();
            Instant expiration = Instant.now().plusSeconds(3000); // token expires after 50 minutes
            ExpirableToken expirableToken = new ExpirableToken(username, expiration);

            tokenMap.put(token, expirableToken);
            userToToken.put(username, token);
            return token;
        } finally {
            lock.unlock();
        }
    }

    public String getUsernameFromToken(String token) {
        lock.lock();
        try {
            ExpirableToken expirableToken = tokenMap.get(token);
            if (expirableToken == null || expirableToken.isExpired()) return null;
            return expirableToken.getUsername();
        } finally {
            lock.unlock();
        }
    }

    public void setUserCurrentRoom(String username, String roomName) {
        lock.lock();
        try {
            userToRoom.put(username, roomName);
        } finally {
            lock.unlock();
        }
    }

    public String getUserCurrentRoom(String username) {
        lock.lock();
        try {
            return userToRoom.get(username);
        } finally {
            lock.unlock();
        }
    }

    public boolean tokenExists(String token) {
        lock.lock();
        try {
            return tokenMap.containsKey(token);
        } finally {
            lock.unlock();
        }
    }

    public boolean tokenIsExpired(String token) {
        lock.lock();
        try {
            ExpirableToken t = tokenMap.get(token);
            return t != null && t.isExpired();
        } finally {
            lock.unlock();
        }
    }

    public void cleanupExpiredTokens() {
        lock.lock();
        try {
            List<String> toRemove = new ArrayList<>();
            for (Map.Entry<String, ExpirableToken> entry : tokenMap.entrySet()) {
                if (entry.getValue().isExpired()) {
                    toRemove.add(entry.getKey());
                }
            }
            for (String token : toRemove) {
                ExpirableToken tokenObj = tokenMap.remove(token);
                if (tokenObj != null) {
                    userToToken.remove(tokenObj.getUsername());
                }
            }
        } finally {
            lock.unlock();
        }
    }
}
