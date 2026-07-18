package com.elevateresume.backend.ai;

import com.elevateresume.backend.config.AppProperties;
import com.elevateresume.backend.shared.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class GroqClient {
    private final AppProperties properties;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GroqClient(AppProperties properties, HttpClient httpClient, ObjectMapper objectMapper) {
        this.properties = properties;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return properties.getGroq().isConfigured();
    }

    public String generate(String prompt) {
        ensureConfigured();

        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", properties.getGroq().getModel());
        body.put("temperature", 0.2);
        ArrayNode messages = objectMapper.createArrayNode();
        ObjectNode message = objectMapper.createObjectNode();
        message.put("role", "user");
        message.put("content", prompt);
        messages.add(message);
        body.set("messages", messages);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/chat/completions"))
                .timeout(Duration.ofSeconds(60))
                .header("Authorization", "Bearer " + properties.getGroq().getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = objectMapper.readTree(response.body());
            if (response.statusCode() >= 400) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "GROQ_API_ERROR", readableError(json));
            }
            return json.path("choices").path(0).path("message").path("content").asText("");
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "GROQ_UNAVAILABLE", exception.getMessage());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "GROQ_INTERRUPTED", "Groq request was interrupted.");
        }
    }

    private void ensureConfigured() {
        if (!isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "GROQ_KEY_MISSING", "Set GROQ_API_KEY before using AI parsing.");
        }
    }

    private String baseUrl() {
        return properties.getGroq().getBaseUrl().replaceAll("/+$", "");
    }

    private String readableError(JsonNode json) {
        JsonNode error = json.path("error");
        if (error.hasNonNull("message")) {
            return error.get("message").asText();
        }
        if (json.hasNonNull("message")) {
            return json.get("message").asText();
        }
        return "Groq AI request failed.";
    }
}
