package com.elevateresume.backend.auth;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.OffsetDateTime;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record AuthRequest(String email, String password, String fullName) {
    }

    public record AuthData(JsonNode user, JsonNode session) {
    }

    public record AuthResponse(String message, AuthData data) {
    }

    public record ProfileUpdateRequest(String fullName, String targetTitle, String experienceLevel) {
    }

    public record ProfileResponse(
            UUID id,
            String email,
            String fullName,
            String onboardedTargetTitle,
            String experienceLevel,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
