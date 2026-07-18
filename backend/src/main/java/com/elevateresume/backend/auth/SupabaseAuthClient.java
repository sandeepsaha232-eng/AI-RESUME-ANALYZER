package com.elevateresume.backend.auth;

import com.elevateresume.backend.config.AppProperties;
import com.elevateresume.backend.shared.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class SupabaseAuthClient {
    private final AppProperties properties;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public SupabaseAuthClient(AppProperties properties, HttpClient httpClient, ObjectMapper objectMapper) {
        this.properties = properties;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    public JsonNode signUp(AuthDtos.AuthRequest request, String redirectUrl) {
        ObjectNode payload = objectMapper.createObjectNode()
                .put("email", request.email())
                .put("password", request.password());

        ObjectNode options = objectMapper.createObjectNode();
        ObjectNode data = objectMapper.createObjectNode();
        data.put("full_name", cleanName(request));
        options.set("data", data);
        if (redirectUrl != null && !redirectUrl.isBlank()) {
            options.put("email_redirect_to", redirectUrl);
        }
        payload.set("options", options);

        return post("/auth/v1/signup", payload);
    }

    public JsonNode login(AuthDtos.AuthRequest request) {
        ObjectNode payload = objectMapper.createObjectNode()
                .put("email", request.email())
                .put("password", request.password());
        return post("/auth/v1/token?grant_type=password", payload);
    }

    public JsonNode getUser(String accessToken) {
        ensureConfigured();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/auth/v1/user"))
                .timeout(Duration.ofSeconds(30))
                .header("apikey", properties.getSupabase().getPublishableKey())
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();
        return send(request);
    }

    private JsonNode post(String path, JsonNode body) {
        ensureConfigured();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + path))
                .timeout(Duration.ofSeconds(30))
                .header("apikey", properties.getSupabase().getPublishableKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();
        return send(request);
    }

    private JsonNode send(HttpRequest request) {
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = response.body() == null || response.body().isBlank()
                    ? objectMapper.createObjectNode()
                    : objectMapper.readTree(response.body());
            if (response.statusCode() >= 400) {
                throw new ApiException(
                        response.statusCode() == 401 ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST,
                        "SUPABASE_AUTH_ERROR",
                        readableError(json));
            }
            return json;
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "SUPABASE_UNAVAILABLE", exception.getMessage());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "SUPABASE_INTERRUPTED", "Supabase request was interrupted.");
        }
    }

    private String readableError(JsonNode json) {
        if (json.hasNonNull("msg")) {
            return json.get("msg").asText();
        }
        if (json.hasNonNull("message")) {
            return json.get("message").asText();
        }
        if (json.hasNonNull("error_description")) {
            return json.get("error_description").asText();
        }
        if (json.hasNonNull("error")) {
            return json.get("error").asText();
        }
        return "Supabase authentication failed.";
    }

    private void ensureConfigured() {
        if (!properties.getSupabase().isConfigured()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "SUPABASE_NOT_CONFIGURED",
                    "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before using authentication.");
        }
    }

    private String baseUrl() {
        return properties.getSupabase().getUrl().replaceAll("/+$", "");
    }

    private String cleanName(AuthDtos.AuthRequest request) {
        if (request.fullName() != null && !request.fullName().isBlank()) {
            return request.fullName().trim();
        }
        if (request.email() != null && request.email().contains("@")) {
            return request.email().substring(0, request.email().indexOf('@'));
        }
        return "User";
    }
}
