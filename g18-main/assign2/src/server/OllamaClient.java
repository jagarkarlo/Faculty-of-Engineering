package server;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class OllamaClient {

    // Escape JSON special characters in the prompt
    private static String escapeJson(String text) {
        return text
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    public static String askBot(String prompt) {
        try {
            String escapedPrompt = escapeJson(prompt);

            // Prepare the JSON body for the request
            String body = String.format("""
                    {
                      "model": "llama3",
                      "prompt": "%s",
                      "stream": false
                    }
                    """, escapedPrompt);

            // Create the HTTP request to Ollama API
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI("http://localhost:11434/api/generate"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return extractResponseText(response.body());
        } catch (Exception e) {
            return "Error getting response from Bot: " + e.getMessage();
        }
    }

    // Extract the response text from the JSON response
    private static String extractResponseText(String json) {
        int idx = json.indexOf("\"response\":\"");
        if (idx == -1) return json;

        int start = idx + "\"response\":\"".length();
        StringBuilder result = new StringBuilder();
        boolean escape = false;

        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);

            if (escape) {
                if (c == 'n') result.append('\n');
                else if (c == 'r') result.append('\r');
                else if (c == 't') result.append('\t');
                else result.append(c); // includes \" \\ etc.
                escape = false;
            } else if (c == '\\') {
                escape = true;
            } else if (c == '"') {
                break; // end of string
            } else {
                result.append(c);
            }
        }

        return result.toString();
    }
}
