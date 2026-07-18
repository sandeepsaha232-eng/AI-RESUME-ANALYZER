package com.elevateresume.backend.shared;

public final class ApiResponses {
    private ApiResponses() {
    }

    public record Data<T>(T data) {
    }

    public record Message(String message) {
    }

    public record Suggestion(String suggestion) {
    }

    public record ErrorBody(String code, String message, String requestId) {
    }

    public record ErrorEnvelope(ErrorBody error) {
    }
}
