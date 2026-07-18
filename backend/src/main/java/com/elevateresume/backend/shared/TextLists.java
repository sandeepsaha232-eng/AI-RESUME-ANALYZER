package com.elevateresume.backend.shared;

import java.util.List;

public final class TextLists {
    private TextLists() {
    }

    public static List<String> clean(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .toList();
    }

    public static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    public static String textOrBlank(String value) {
        return value == null ? "" : value;
    }
}
