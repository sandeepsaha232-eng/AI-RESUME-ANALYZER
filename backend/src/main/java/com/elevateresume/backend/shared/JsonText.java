package com.elevateresume.backend.shared;

public final class JsonText {
    private JsonText() {
    }

    public static String cleanJsonBlock(String text) {
        if (text == null || text.isBlank()) {
            return "{}";
        }

        String cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(?:json)?", "");
            cleaned = cleaned.replaceFirst("```$", "");
        }
        return cleaned.trim();
    }
}
