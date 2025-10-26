package common;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Message implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String sender;
    private final String content;
    private final String roomName;
    private final LocalDateTime timestamp;
    private final MessageType type;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    public enum MessageType {
        CHAT, SYSTEM, PRIVATE
    }

    public Message(String sender, String content, String roomName, MessageType type) {
        this.sender = sender;
        this.content = content;
        this.roomName = roomName;
        this.timestamp = LocalDateTime.now();
        this.type = type;
    }

    public String format() {
        String time = timestamp.format(FORMATTER);

        return switch (type) {
            case CHAT -> String.format("[%s] %s: %s", time, sender, content);
            case SYSTEM -> String.format("[%s] *** %s ***", time, content);
            case PRIVATE -> String.format("[%s] (Private) %s: %s", time, sender, content);
            default -> String.format("[%s] %s", time, content);
        };
    }

    public String formatForTransmission() {
        return ChatProtocol.MESSAGE + ' ' + format();
    }

    public String getSender() {
        return sender;
    }

    public String getContent() {
        return content;
    }
}