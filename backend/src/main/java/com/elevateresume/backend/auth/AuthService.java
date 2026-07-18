package com.elevateresume.backend.auth;

import com.elevateresume.backend.shared.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final SupabaseAuthClient supabase;
    private final ProfileService profiles;
    private final ObjectMapper objectMapper;

    public AuthService(SupabaseAuthClient supabase, ProfileService profiles, ObjectMapper objectMapper) {
        this.supabase = supabase;
        this.profiles = profiles;
        this.objectMapper = objectMapper;
    }

    public AuthDtos.AuthResponse signUp(AuthDtos.AuthRequest request, String redirectUrl) {
        validateCredentials(request);
        JsonNode result = supabase.signUp(request, redirectUrl);
        JsonNode user = extractUser(result);
        UUID userId = parseUserId(user);
        String email = user.path("email").asText(request.email());
        profiles.ensureProfile(userId, email, cleanName(request));
        return new AuthDtos.AuthResponse(
                "Signup successful",
                new AuthDtos.AuthData(nullIfMissing(user), sessionNode(result)));
    }

    public AuthDtos.AuthResponse login(AuthDtos.AuthRequest request) {
        validateCredentials(request);
        JsonNode result = supabase.login(request);
        JsonNode user = extractUser(result);
        UUID userId = parseUserId(user);
        String email = user.path("email").asText(request.email());
        profiles.ensureProfile(userId, email, cleanName(request));
        return new AuthDtos.AuthResponse(
                "Login successful",
                new AuthDtos.AuthData(nullIfMissing(user), sessionNode(result)));
    }

    public CurrentUser requireUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Access token is required. Please sign in.");
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        JsonNode user = supabase.getUser(token);
        UUID id = parseUserId(user);
        String email = user.path("email").asText("");
        if (email.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Token did not include a user email.");
        }
        return new CurrentUser(id, email);
    }

    private void validateCredentials(AuthDtos.AuthRequest request) {
        if (request == null || request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "Email and password are required.");
        }
    }

    private UUID parseUserId(JsonNode user) {
        String id = user.path("id").asText("");
        if (id.isBlank()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "INVALID_SUPABASE_USER", "Supabase response did not include a user id.");
        }
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "INVALID_SUPABASE_USER", "Supabase returned an invalid user id.");
        }
    }

    private JsonNode nullIfMissing(JsonNode node) {
        return node == null || node.isMissingNode() || node.isNull() ? null : node;
    }

    private JsonNode extractUser(JsonNode result) {
        JsonNode user = result.path("user");
        if (!user.isMissingNode() && !user.isNull()) {
            return user;
        }
        if (result.hasNonNull("id") && result.hasNonNull("email")) {
            return result;
        }
        throw new ApiException(HttpStatus.BAD_GATEWAY, "INVALID_SUPABASE_USER", "Supabase response did not include a user.");
    }

    private JsonNode sessionNode(JsonNode result) {
        JsonNode session = result.path("session");
        if (!session.isMissingNode() && !session.isNull()) {
            return session;
        }
        if (!result.hasNonNull("access_token")) {
            return null;
        }

        ObjectNode normalized = objectMapper.createObjectNode();
        normalized.put("access_token", result.path("access_token").asText());
        if (result.hasNonNull("refresh_token")) {
            normalized.put("refresh_token", result.path("refresh_token").asText());
        }
        if (result.hasNonNull("expires_in")) {
            normalized.put("expires_in", result.path("expires_in").asInt());
        }
        if (result.hasNonNull("token_type")) {
            normalized.put("token_type", result.path("token_type").asText());
        }
        return normalized;
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
