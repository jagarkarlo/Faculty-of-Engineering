# 💬 Project 2 – CPD

A secure multi-room chat system in Java with optional AI-powered rooms using [Ollama](https://ollama.com) and the LLaMA 3.2 model.

---

## 🧰 Requirements

- Java SE 21 or later
- [Ollama](https://ollama.com) installed locally
- LLaMA 3.2 model installed via Ollama
- Terminal or command prompt

---

## 🚀 Setup Instructions

### 1. Install Java

Download and install Java SE 21+:

- https://www.oracle.com/java/technologies/javase-downloads.html

Verify installation:

```bash
java -version
```

---

### 2. Install and Configure Ollama

Download and install Ollama:

- https://ollama.com

Then in a terminal, pull the default LLaMA 3 model and tag it as `llama3.2`:

```bash
ollama pull llama3
ollama tag llama3:latest llama3.2
```

Now start the model:

```bash
ollama run llama3.2
```

This starts a local server at `http://localhost:11434`.

**Note:** Leave this running in a separate terminal while using the chat system.

---

### 3. Compile the Java Code
### 4. Run the Server
### 5. Run Clients
## 💬 Client Commands

| Command                         | Description                                      |
|---------------------------------|--------------------------------------------------|
| `REGISTER <username> <pass>`    | Register a new user                              |
| `LOGIN <username> <pass>`       | Log in and receive a session token               |
| `TOKEN_AUTH <token>`            | Reconnect using a previously issued token        |
| `CREATE <room>`                 | Create a new chat room                           |
| `CREATE ai:<room>`              | Create an AI-powered room using LLaMA 3.2        |
| `JOIN <room>`                   | Join an existing chat room                       |
| `LIST`                          | List all available chat rooms                    |
| `QUIT`                          | Exit the chat client                             |

---

## 🧪 Testing with Multiple Clients

To simulate simultaneous users:

1. Open multiple terminals
2. Register and log in with unique usernames
3. Join the same room and send messages

### Example

**Client A:**

```text
REGISTER alice 123
LOGIN alice 123
CREATE general
JOIN general
SEND Hello from Alice!
```

**Client B:**

```text
REGISTER bob 456
LOGIN bob 456
JOIN general
SEND Hi Alice, this is Bob!
```

---

## 🤖 AI-Powered Rooms

Create a room with `ai:` prefix:

```text
CREATE ai:botroom
JOIN ai:botroom
SEND What's the weather like?
```

**Ensure `ollama run llama3.2` is running**, or you'll get an error:

```json
{"error":"model 'llama3.2' not found"}
```

---

## 🔐 Token Authentication

After login, a token is returned:

```text
Your session token is: abcdef1234
```

Reconnect later using:

```text
TOKEN_AUTH abcdef1234
```

- Tokens are valid for 50 minutes
- If expired, they are deleted and considered invalid
- If valid, your previous session and room are restored

---

## 🔬 Advanced Testing Scenarios

These examples show how to test more complex features like token-based reconnection and fault tolerance.

---

### 🧑‍💻 Scenario 1: Persistent Login with Tokens

#### Client A (initial session):

```text
REGISTER alice 1234
LOGIN alice 1234
# Output: Your session token is: abcdef1234 (save this)
CREATE general
JOIN general
SEND Hello, this is Alice!
```

#### Client A (after reconnecting with new terminal):

```text
TOKEN_AUTH abcdef1234
SEND I'm back without logging in again!
```

---

### 🌐 Scenario 2: Fault Tolerance (Broken Connection Recovery)

Simulate a user losing connection and reconnecting without re-authenticating.

#### Client B (initial session):

```text
REGISTER bob 4321
LOGIN bob 4321
# Save the token: ghijkl9876
JOIN general
SEND Hey Alice, it's Bob!
```

Now close the terminal (simulate a crash or disconnection).

#### Client B (reconnecting):

Open a new terminal:

```text
java TestClient
TOKEN_AUTH ghijkl9876
SEND Reconnected successfully!
```

---

## 🛠 Troubleshooting

- ✅ Ensure Java 21+ is installed and on your PATH
- ✅ Start Ollama with: `ollama run llama3.2`
- ✅ Ensure port is not blocked by a firewall
- 🛑 If you see `"model 'llama3.2' not found"`, run:

```bash
ollama pull llama3.2
```

---

## 📄 License

This project is for academic and educational purposes only.
