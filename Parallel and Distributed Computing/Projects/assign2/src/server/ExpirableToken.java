package server;

import java.time.Instant;

public class ExpirableToken {
    private final String username;
    private final Instant expirationTime;

    public ExpirableToken(String username, Instant expirationTime) {
        this.username = username;
        this.expirationTime = expirationTime;
    }

    public String getUsername() {
        return username;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expirationTime);
    }
}
