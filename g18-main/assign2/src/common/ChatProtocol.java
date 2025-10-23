package common;

public class ChatProtocol {

    // Client commands
    public static final String LOGIN = "LOGIN";
    public static final String REGISTER = "REGISTER";
    public static final String JOIN = "JOIN";
    public static final String CREATE = "CREATE";
    public static final String SEND = "SEND";
    public static final String LIST = "LIST";
    public static final String QUIT = "QUIT";

    // Server responses
    public static final String LOGIN_SUCCESS = "LOGIN_SUCCESS";
    public static final String LOGIN_FAILED = "LOGIN_FAILED";
    public static final String REGISTER_SUCCESS = "REGISTER_SUCCESS";
    public static final String REGISTER_FAILED = "REGISTER_FAILED";
    public static final String JOINED = "JOINED";
    public static final String ROOM_CREATED = "ROOM_CREATED";
    public static final String ROOMS = "ROOMS";
    public static final String MESSAGE = "MESSAGE";
    public static final String ERROR = "ERROR";
    public static final String GOODBYE = "GOODBYE";

    // Error messages
    public static final String ERROR_NOT_LOGGED_IN = "You must login first";
    public static final String ERROR_ROOM_EXISTS = "Room already exists";
    public static final String ERROR_ROOM_NOT_EXISTS = "Room does not exist";
    public static final String ERROR_NOT_IN_ROOM = "You must join a room first";
    public static final String ERROR_INVALID_COMMAND = "Invalid command format";

    // Auth
    public static final String TOKEN_AUTH = "TOKEN_AUTH";
    public static final String TOKEN_AUTH_SUCCESS = "TOKEN_AUTH_SUCCESS";
    public static final String TOKEN_AUTH_FAILED = "TOKEN_AUTH_FAILED";
    
    public static String[] parseCommand(String input) {
        return input.split(" ", 3);
    }

    

}